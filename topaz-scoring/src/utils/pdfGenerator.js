import { jsPDF } from 'jspdf';
import { normalizeGroupMemberRow } from './entryFilters';

/**
 * Check if an entry is a group (duo, trio, or group)
 */
const isGroupEntry = (entry) => {
  if (!entry) return false;

  if (entry.group_members && Array.isArray(entry.group_members) && entry.group_members.length > 0) {
    return true;
  }

  const danceType = entry.dance_type || '';
  const groupTypes = ['Duo', 'Trio', 'Small Group', 'Large Group', 'Production'];
  return groupTypes.some((type) => danceType.includes(type));
};

/**
 * Load image from URL and convert to base64 data URL
 * @param {string} url
 * @param {'image/jpeg'|'image/png'} [mime='image/jpeg']
 */
const loadImageAsBase64 = (url, mime = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL provided'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (mime === 'image/jpeg') {
          // JPEG has no alpha — fill white so transparent PNGs don't go black
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image from ${url}`));
    };

    img.src = url;
  });
};

const loadImageSafe = async (url, mime = 'image/png') => {
  try {
    return await loadImageAsBase64(url, mime);
  } catch {
    return null;
  }
};

/** Detect jsPDF image format from a data URL. */
const imageFormatFromDataUrl = (dataUrl) =>
  typeof dataUrl === 'string' && dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';

/**
 * Draw a full-width labeled field with wrapping. Returns new y.
 */
const drawWrappedField = (doc, label, value, x, y, maxWidth, lineHeight = 4) => {
  const text = `${label}: ${value || 'N/A'}`;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

/**
 * Truncate text to fit a single-line column width.
 */
const fitTextToWidth = (doc, text, maxWidth) => {
  if (!text || doc.getTextWidth(text) <= maxWidth) return text || '';
  let truncated = text;
  while (truncated.length > 3 && doc.getTextWidth(`${truncated}...`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
};

/**
 * Generate a professional championship-style score sheet PDF.
 * Layout is intentionally compact so a typical entry (≤4 judges) fits on one A4 page.
 */
export const generateScoreSheet = async (entry, allScores, category, ageDivision, competition) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 12;
    const contentW = pageWidth - marginX * 2;
    const footerReserve = 12;
    const bottomLimit = pageHeight - footerReserve;

    const tealColor = [20, 184, 166];
    const cyanColor = [6, 182, 212];
    const darkGray = [55, 65, 81];
    const midGray = [75, 85, 99];
    const lightGray = [243, 244, 246];

    let yPos = 0;

    // =============================================================================
    // TOP BANNER — left dancer | logo | right dancer (same branding as scoring app)
    // =============================================================================
    const [leftDancer, logoImg, rightDancer] = await Promise.all([
      loadImageSafe('/left-dancer.png', 'image/png'),
      loadImageSafe('/logo.png', 'image/png'),
      loadImageSafe('/right-dancer.png', 'image/png'),
    ]);

    const bannerH = 28;
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, bannerH, 'F');

    const dancerW = 22;
    const dancerH = 24;
    const logoW = 18;
    const logoH = 20;
    const bannerY = 2;

    if (leftDancer) {
      doc.addImage(leftDancer, imageFormatFromDataUrl(leftDancer), marginX + 8, bannerY, dancerW, dancerH);
    }
    if (logoImg) {
      doc.addImage(logoImg, imageFormatFromDataUrl(logoImg), (pageWidth - logoW) / 2, bannerY + 1, logoW, logoH);
    }
    if (rightDancer) {
      doc.addImage(
        rightDancer,
        imageFormatFromDataUrl(rightDancer),
        pageWidth - marginX - 8 - dancerW,
        bannerY,
        dancerW,
        dancerH,
      );
    }

    // Brand wordmark under/near logo if images missing
    if (!logoImg) {
      doc.setTextColor(...darkGray);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TOPAZ 2.0', pageWidth / 2, 16, { align: 'center' });
    }

    yPos = bannerH;

    // Teal title strip
    const stripH = 12;
    doc.setFillColor(...cyanColor);
    doc.rect(0, yPos, pageWidth / 2, stripH, 'F');
    doc.setFillColor(...tealColor);
    doc.rect(pageWidth / 2, yPos, pageWidth / 2, stripH, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOPAZ 2.0  ·  OFFICIAL SCORE SHEET', pageWidth / 2, yPos + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Dance & Performing Arts Competition  ·  Heritage Since 1972', pageWidth / 2, yPos + 9.5, {
      align: 'center',
    });

    yPos += stripH + 4;

    // =============================================================================
    // COMPETITION INFO (compact)
    // =============================================================================
    doc.setFillColor(...lightGray);
    doc.roundedRect(marginX, yPos, contentW, 14, 2, 2, 'F');

    doc.setTextColor(...darkGray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(competition?.name || 'Competition', marginX + 3, yPos + 5.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const dateStr = competition?.date
      ? new Date(competition.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
    const judgesCount = Math.min(competition?.judges_count || 0, 4);
    const compMeta = [dateStr, competition?.venue, `${judgesCount || entryScoresHint(allScores, entry)} Judges`]
      .filter(Boolean)
      .join('  ·  ');
    doc.text(compMeta, marginX + 3, yPos + 10.5);

    yPos += 17;

    // =============================================================================
    // ENTRY INFORMATION (compact — box sized to content, no empty padding)
    // =============================================================================
    const isGroup = isGroupEntry(entry);
    const hasGroupMembers =
      entry.group_members && Array.isArray(entry.group_members) && entry.group_members.length > 0;
    const skipPhoto = isGroup && hasGroupMembers && entry.group_members.length > 5;
    const hasPhoto = !!entry.photo_url && !skipPhoto;
    const fieldMaxWidth = contentW - 6;
    doc.setFontSize(8.5);

    let entryInnerH = 5 + 5 + 4.5; // title + entry#/name
    let photoData = null;
    const photoSize = 28;
    if (hasPhoto) {
      try {
        photoData = await loadImageAsBase64(entry.photo_url);
        entryInnerH += photoSize + 3;
      } catch {
        photoData = null;
      }
    }

    let memberLines = [];
    if (isGroup && hasGroupMembers) {
      const memberBits = entry.group_members.map((member) => {
        const { name, age } = normalizeGroupMemberRow(member);
        return `${name || 'Unknown'}${age != null ? ` (${age})` : ''}`;
      });
      memberLines = doc.splitTextToSize(memberBits.join('  ·  '), contentW - 8);
      entryInnerH += 3.5 + memberLines.length * 3.5 + 1;
    }
    if (entry.studio_name) entryInnerH += 3.5;
    if (entry.teacher_name) entryInnerH += 3.5;

    const countFieldLines = (label, value) =>
      doc.splitTextToSize(`${label}: ${value || 'N/A'}`, fieldMaxWidth).length;
    entryInnerH +=
      (countFieldLines('Category', category?.name) +
        countFieldLines('Age Division', ageDivision?.name) +
        countFieldLines('Ability Level', entry.ability_level) +
        countFieldLines('Division Type', entry.dance_type)) *
        3.5 +
      2;
    if (entry.is_medal_program) entryInnerH += 5;
    entryInnerH += 3; // bottom padding

    const entryBoxTop = yPos;
    doc.setFillColor(...lightGray);
    doc.roundedRect(marginX, entryBoxTop, contentW, entryInnerH, 2, 2, 'F');
    yPos = entryBoxTop + 5;

    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Entry Information', marginX + 3, yPos);
    yPos += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entry #: ${entry.entry_number}`, marginX + 3, yPos);
    doc.text(`Name: ${entry.competitor_name || 'N/A'}`, marginX + 55, yPos);
    yPos += 4.5;

    if (photoData) {
      doc.addImage(
        photoData,
        imageFormatFromDataUrl(photoData),
        (pageWidth - photoSize) / 2,
        yPos,
        photoSize,
        photoSize,
      );
      yPos += photoSize + 3;
    }

    if (memberLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Group Members:', marginX + 3, yPos);
      yPos += 3.5;
      doc.setFont('helvetica', 'normal');
      doc.text(memberLines, marginX + 3, yPos);
      yPos += memberLines.length * 3.5 + 1;
    }

    if (entry.studio_name) {
      doc.text(`Studio: ${entry.studio_name}`, marginX + 3, yPos);
      yPos += 3.5;
    }
    if (entry.teacher_name) {
      doc.text(`Teacher/Choreographer: ${entry.teacher_name}`, marginX + 3, yPos);
      yPos += 3.5;
    }

    yPos = drawWrappedField(doc, 'Category', category?.name, marginX + 3, yPos, fieldMaxWidth, 3.5) + 0.5;
    yPos = drawWrappedField(doc, 'Age Division', ageDivision?.name, marginX + 3, yPos, fieldMaxWidth, 3.5) + 0.5;
    yPos = drawWrappedField(doc, 'Ability Level', entry.ability_level, marginX + 3, yPos, fieldMaxWidth, 3.5) + 0.5;
    yPos = drawWrappedField(doc, 'Division Type', entry.dance_type, marginX + 3, yPos, fieldMaxWidth, 3.5) + 0.5;

    if (entry.is_medal_program) {
      doc.setFillColor(...tealColor);
      doc.roundedRect(marginX + 3, yPos - 2.5, 32, 4.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('Medal Program', marginX + 5, yPos + 0.5);
      doc.setTextColor(...darkGray);
      yPos += 5;
    }

    yPos = entryBoxTop + entryInnerH + 3;

    // =============================================================================
    // SCORES TABLE (≤4 judges)
    // =============================================================================
    const entryScores = allScores
      .filter((s) => s.entry_id === entry.id)
      .sort((a, b) => (a.judge_number || 0) - (b.judge_number || 0))
      .slice(0, 4);

    if (entryScores.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor(200, 0, 0);
      doc.text('No scores available for this entry', pageWidth / 2, yPos + 10, { align: 'center' });
      drawFooter(doc, pageWidth, pageHeight);
      doc.save(`Entry-${entry.entry_number}-ScoreSheet.pdf`);
      return { success: true };
    }

    const rowH = 6;
    doc.setFillColor(...tealColor);
    doc.roundedRect(marginX, yPos, contentW, 7, 1.5, 1.5, 'F');

    const colWidths = [36, 26, 26, 32, 26, 28];
    const colPositions = [marginX + 3];
    for (let i = 1; i < colWidths.length; i++) {
      colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
    }
    const scoreRightEdges = colWidths.map((w, i) => colPositions[i] + w - 2);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Judge', colPositions[0], yPos + 4.5);
    doc.text('Technique', colPositions[1], yPos + 4.5);
    doc.text('Creativity', colPositions[2], yPos + 4.5);
    doc.text('Presentation', colPositions[3], yPos + 4.5);
    doc.text('Appearance', colPositions[4], yPos + 4.5);
    doc.text('Total', colPositions[5], yPos + 4.5);
    yPos += 8;

    doc.setFontSize(8);
    entryScores.forEach((score, rowIndex) => {
      if (rowIndex % 2 === 0) {
        doc.setFillColor(...lightGray);
        doc.rect(marginX, yPos - 2, contentW, rowH, 'F');
      }

      const judgeName = competition?.judge_names?.[score.judge_number - 1];
      doc.setTextColor(...darkGray);
      doc.setFont('helvetica', 'bold');
      const judgeLabel = fitTextToWidth(
        doc,
        judgeName || `Judge ${score.judge_number}`,
        colWidths[0] - 3,
      );
      doc.text(judgeLabel, colPositions[0], yPos + 2.5);

      doc.setFont('helvetica', 'normal');
      doc.text(Number(score.technique || 0).toFixed(2), scoreRightEdges[1], yPos + 2.5, { align: 'right' });
      doc.text(Number(score.creativity || 0).toFixed(2), scoreRightEdges[2], yPos + 2.5, { align: 'right' });
      doc.text(Number(score.presentation || 0).toFixed(2), scoreRightEdges[3], yPos + 2.5, { align: 'right' });
      doc.text(Number(score.appearance || 0).toFixed(2), scoreRightEdges[4], yPos + 2.5, { align: 'right' });
      doc.text(Number(score.total_score || 0).toFixed(2), scoreRightEdges[5], yPos + 2.5, { align: 'right' });

      yPos += rowH;
    });

    const avgTechnique =
      entryScores.reduce((sum, s) => sum + Number(s.technique || 0), 0) / entryScores.length;
    const avgCreativity =
      entryScores.reduce((sum, s) => sum + Number(s.creativity || 0), 0) / entryScores.length;
    const avgPresentation =
      entryScores.reduce((sum, s) => sum + Number(s.presentation || 0), 0) / entryScores.length;
    const avgAppearance =
      entryScores.reduce((sum, s) => sum + Number(s.appearance || 0), 0) / entryScores.length;
    const avgTotal =
      entryScores.reduce((sum, s) => sum + Number(s.total_score || 0), 0) / entryScores.length;

    yPos += 1;
    doc.setFillColor(...cyanColor);
    doc.roundedRect(marginX, yPos - 2, contentW, 7, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AVERAGE', colPositions[0], yPos + 2.5);
    doc.text(avgTechnique.toFixed(2), scoreRightEdges[1], yPos + 2.5, { align: 'right' });
    doc.text(avgCreativity.toFixed(2), scoreRightEdges[2], yPos + 2.5, { align: 'right' });
    doc.text(avgPresentation.toFixed(2), scoreRightEdges[3], yPos + 2.5, { align: 'right' });
    doc.text(avgAppearance.toFixed(2), scoreRightEdges[4], yPos + 2.5, { align: 'right' });
    doc.text(avgTotal.toFixed(2), scoreRightEdges[5], yPos + 2.5, { align: 'right' });
    yPos += 9;

    // =============================================================================
    // JUDGES' COMMENTS (compact — up to 4)
    // =============================================================================
    const scoresWithNotes = entryScores.filter((s) => s.notes && String(s.notes).trim());

    if (scoresWithNotes.length > 0) {
      doc.setFillColor(...tealColor);
      doc.roundedRect(marginX, yPos, contentW, 6.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text("JUDGES' COMMENTS", marginX + 3, yPos + 4.2);
      yPos += 8;

      const commentMaxWidth = contentW - 6;
      const maxLinesPerJudge = 3;

      scoresWithNotes.forEach((score) => {
        const remaining = bottomLimit - yPos - 28; // leave room for total + medal/footer
        if (remaining < 10) return;

        const judgeName = competition?.judge_names?.[score.judge_number - 1];
        const judgeLabel = judgeName || `Judge ${score.judge_number}`;
        let noteLines = doc.splitTextToSize(String(score.notes).trim(), commentMaxWidth);
        if (noteLines.length > maxLinesPerJudge) {
          noteLines = noteLines.slice(0, maxLinesPerJudge);
          const last = noteLines[maxLinesPerJudge - 1];
          noteLines[maxLinesPerJudge - 1] =
            last.length > 3 ? `${last.slice(0, Math.max(last.length - 3, 1))}...` : `${last}...`;
        }

        doc.setTextColor(...darkGray);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(judgeLabel, marginX + 3, yPos);
        yPos += 3.2;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...midGray);
        doc.text(noteLines, marginX + 3, yPos);
        yPos += noteLines.length * 3.2 + 2.5;
      });

      yPos += 1;
    }

    // =============================================================================
    // TOTAL SCORE
    // =============================================================================
    doc.setFillColor(...lightGray);
    doc.roundedRect(marginX, yPos, contentW, 14, 2, 2, 'F');
    doc.setTextColor(...darkGray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL SCORE', pageWidth / 2, yPos + 5, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(...tealColor);
    doc.text(`${avgTotal.toFixed(2)} / 100`, pageWidth / 2, yPos + 11.5, { align: 'center' });
    yPos += 17;

    // =============================================================================
    // MEDAL PROGRAM STATUS (compact)
    // =============================================================================
    if (entry.is_medal_program) {
      const getNextMedalInfo = (currentPoints) => {
        const points = currentPoints || 0;
        if (points < 25) return { level: 'Bronze', threshold: 25, pointsNeeded: 25 - points };
        if (points < 35) return { level: 'Silver', threshold: 35, pointsNeeded: 35 - points };
        if (points < 50) return { level: 'Gold', threshold: 50, pointsNeeded: 50 - points };
        return null;
      };

      const currentMedalLevel = entry.current_medal_level || 'None';
      const medalPoints = entry.medal_points || 0;
      const nextMedal = getNextMedalInfo(medalPoints);

      doc.setFillColor(...lightGray);
      doc.roundedRect(marginX, yPos, contentW, nextMedal ? 18 : 14, 2, 2, 'F');
      doc.setTextColor(...darkGray);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDAL PROGRAM STATUS', pageWidth / 2, yPos + 4.5, { align: 'center' });

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Medal Level: ${currentMedalLevel}  ·  Total Points: ${medalPoints}`, marginX + 3, yPos + 9);

      if (nextMedal) {
        doc.setTextColor(...midGray);
        doc.text(
          `Progress: ${nextMedal.pointsNeeded} pts to ${nextMedal.level} (${nextMedal.threshold} pts)${
            nextMedal.level !== 'Gold' ? '  ·  Gold at 50' : ''
          }`,
          marginX + 3,
          yPos + 13.5,
        );
        yPos += 20;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...tealColor);
        doc.text('Gold Medal Achieved!', marginX + 3, yPos + 12);
        yPos += 16;
      }
    }

    drawFooter(doc, pageWidth, pageHeight);

    const fileName = `Entry-${entry.entry_number}-${entry.competitor_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'ScoreSheet'}-${competition?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Competition'}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  }
};

function entryScoresHint(allScores, entry) {
  return allScores.filter((s) => s.entry_id === entry.id).length || 0;
}

function drawFooter(doc, pageWidth, pageHeight) {
  const footerY = pageHeight - 8;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('TOPAZ 2.0 Dance Competition  ·  Heritage Since 1972', pageWidth / 2, footerY, {
    align: 'center',
  });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 3.5, {
    align: 'center',
  });
}

/**
 * Generate all scorecards for a competition
 */
export const generateAllScorecards = async (
  entries,
  allScores,
  categories,
  ageDivisions,
  competition,
  onProgress,
) => {
  try {
    let generated = 0;
    const total = entries.length;

    for (const entry of entries) {
      const entryScores = allScores.filter((s) => s.entry_id === entry.id);
      if (entryScores.length === 0) continue;

      const category = categories.find((c) => c.id === entry.category_id);
      const ageDivision = ageDivisions.find((d) => d.id === entry.age_division_id);

      await generateScoreSheet(entry, allScores, category, ageDivision, competition);

      generated++;
      if (onProgress) onProgress({ current: generated, total });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { success: true, count: generated };
  } catch (error) {
    console.error('❌ Error generating scorecards:', error);
    return { success: false, error: error.message };
  }
};

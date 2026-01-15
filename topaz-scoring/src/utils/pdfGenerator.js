import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a professional championship-style score sheet PDF
 */
export const generateScoreSheet = async (entry, allScores, category, ageDivision, competition) => {
  console.log('🏁 Initializing PDF generation...');
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    console.log('📐 Document setup:', { pageWidth, pageHeight });
    
    // Championship Colors
    const tealColor = [20, 184, 166]; // teal-500
    const cyanColor = [6, 182, 212]; // cyan-500
    const goldColor = [251, 191, 36]; // yellow-400
    const silverColor = [209, 213, 219]; // gray-300
    const bronzeColor = [251, 146, 60]; // orange-400
    const darkGray = [55, 65, 81]; // gray-700
    const lightGray = [243, 244, 246]; // gray-100
    
    let yPos = 0;
    
    // =============================================================================
    // CHAMPIONSHIP HEADER
    // =============================================================================
    console.log('🏛️ Adding header...');
    
    // Gradient-style header (simulated with two rectangles)
    doc.setFillColor(...cyanColor);
    doc.rect(0, 0, pageWidth / 2, 45, 'F');
    doc.setFillColor(...tealColor);
    doc.rect(pageWidth / 2, 0, pageWidth / 2, 45, 'F');
    
    // Main Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('TOPAZ 2.0', pageWidth / 2, 15, { align: 'center' });
    
    // Championship subtitle
    doc.setFontSize(14);
    doc.text('DANCE COMPETITION', pageWidth / 2, 24, { align: 'center' });
    
    // Official Score Sheet
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Score Sheet', pageWidth / 2, 31, { align: 'center' });
    doc.text('Heritage Since 1972', pageWidth / 2, 37, { align: 'center' });
    
    yPos = 55;
    
    // =============================================================================
    // COMPETITION INFO CARD
    // =============================================================================
    console.log('📋 Adding competition info card...');
    
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, yPos, pageWidth - 28, 28, 3, 3, 'F');
    yPos += 8;
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(competition?.name || 'Competition', 18, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (competition?.date) {
      const dateStr = new Date(competition.date).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      doc.text(dateStr, 18, yPos);
    }
    if (competition?.venue) {
      doc.text(` • ${competition.venue}`, 80, yPos);
    }
    yPos += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text(`${competition?.judges_count || 0} Judges • Entry #${entry?.entry_number}`, 18, yPos);
    
    yPos += 15;
    
    // =============================================================================
    // COMPETITOR INFO SECTION (Championship Style)
    // =============================================================================
    console.log('👤 Adding competitor info section...');
    
    // Get rank if available (from averageScore context)
    const rank = entry.rank || null;
    const averageScore = entry.averageScore || null;
    
    // Rank-based styling
    let headerColor = tealColor;
    let medalEmoji = '';
    if (rank === 1) {
      headerColor = goldColor;
      medalEmoji = '🥇';
    } else if (rank === 2) {
      headerColor = silverColor;
      medalEmoji = '🥈';
    } else if (rank === 3) {
      headerColor = bronzeColor;
      medalEmoji = '🥉';
    }
    
    // Colored header bar
    doc.setFillColor(...headerColor);
    doc.roundedRect(14, yPos, pageWidth - 28, 45, 3, 3, 'F');
    
    // Rank badge (if applicable)
    if (rank) {
      doc.setFillColor(255, 255, 255);
      doc.circle(28, yPos + 22, 12, 'F');
      
      doc.setTextColor(...headerColor);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(rank.toString(), 28, yPos + 25, { align: 'center' });
      
      doc.setFontSize(6);
      const suffix = rank === 1 ? 'ST' : rank === 2 ? 'ND' : rank === 3 ? 'RD' : 'TH';
      doc.text(suffix, 28, yPos + 29, { align: 'center' });
    }
    
    // Competitor name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const nameX = rank ? 45 : 18;
    const nameText = entry.age ? 
      `${entry.competitor_name} (Age ${entry.age})` : 
      entry.competitor_name;
    doc.text(nameText, nameX, yPos + 15);
    
    // Medal emoji for top 3
    if (medalEmoji) {
      doc.setFontSize(16);
      doc.text(medalEmoji, pageWidth - 25, yPos + 15);
    }
    
    // Category badges
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let badgeY = yPos + 25;
    let badgeX = nameX;
    
    // Category
    if (category) {
      doc.text(`${category.name}`, badgeX, badgeY);
      badgeX += doc.getTextWidth(category.name) + 10;
    }
    
    // Age Division
    if (ageDivision) {
      doc.text(`• ${ageDivision.name}`, badgeX, badgeY);
      badgeX += doc.getTextWidth(`• ${ageDivision.name}`) + 10;
    }
    
    // Ability Level
    if (entry.ability_level) {
      doc.text(`• ${entry.ability_level}`, badgeX, badgeY);
    }
    
    // Category Rank (if available) - NEW
    if (entry.categoryRank) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...goldColor);
      const rankSuffix = entry.categoryRank === 1 ? 'st' : entry.categoryRank === 2 ? 'nd' : entry.categoryRank === 3 ? 'rd' : 'th';
      doc.text(`🏆 ${entry.categoryRank}${rankSuffix} Place in Category Combination`, nameX, yPos + 28);
    }
    
    // Average score (if available)
    if (averageScore) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkGray);
      const scoreY = entry.categoryRank ? yPos + 36 : yPos + 28;
      doc.text(`Average: ${averageScore.toFixed(2)} / 100`, nameX, scoreY);
    }
    
    yPos += 55;
    
    // =============================================================================
    // DETAILED SCORES TABLE
    // =============================================================================
    console.log('📈 Adding scores table...');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Score Breakdown', 14, yPos);
    yPos += 8;
    
    // Filter scores for this entry
    const entryScores = allScores.filter(s => s.entry_id === entry.id);
    
    if (entryScores.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('No scores available for this entry', 14, yPos);
      yPos += 20;
    } else {
      // Prepare table data
      const tableData = [];
      
      // Individual judge scores
      entryScores.forEach(score => {
        const judgeName = competition?.judge_names?.[score.judge_number - 1] || `Judge ${score.judge_number}`;
        tableData.push([
          judgeName,
          `${Number(score.technique).toFixed(1)} / 25`,
          `${Number(score.creativity).toFixed(1)} / 25`,
          `${Number(score.presentation).toFixed(1)} / 25`,
          `${Number(score.appearance).toFixed(1)} / 25`,
          `${Number(score.total_score).toFixed(1)} / 100`
        ]);
      });
      
      // Calculate averages
      const avgTechnique = entryScores.reduce((sum, s) => sum + Number(s.technique), 0) / entryScores.length;
      const avgCreativity = entryScores.reduce((sum, s) => sum + Number(s.creativity), 0) / entryScores.length;
      const avgPresentation = entryScores.reduce((sum, s) => sum + Number(s.presentation), 0) / entryScores.length;
      const avgAppearance = entryScores.reduce((sum, s) => sum + Number(s.appearance), 0) / entryScores.length;
      const avgTotal = entryScores.reduce((sum, s) => sum + Number(s.total_score), 0) / entryScores.length;
      
      // Add average row
      tableData.push([
        'AVERAGE',
        `${avgTechnique.toFixed(2)} / 25`,
        `${avgCreativity.toFixed(2)} / 25`,
        `${avgPresentation.toFixed(2)} / 25`,
        `${avgAppearance.toFixed(2)} / 25`,
        `${avgTotal.toFixed(2)} / 100`
      ]);
      
      // Create beautiful table
      doc.autoTable({
        startY: yPos,
        head: [['Judge', 'Technique', 'Creativity', 'Presentation', 'Appearance', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: tealColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 9,
          halign: 'center',
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { 
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: { left: 6 }
          }
        },
        didParseCell: function(data) {
          // Style the average row
          if (data.row.index === entryScores.length) {
            data.cell.styles.fillColor = headerColor;
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 10;
          }
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // =============================================================================
      // CATEGORY BREAKDOWN (Per Judge)
      // =============================================================================
      console.log('📊 Adding category analysis...');
      
      doc.setTextColor(...darkGray);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Analysis', 14, yPos);
      yPos += 8;
      
      // Create category comparison table
      const categoryRows = [
        ['Technique', ...entryScores.map(s => Number(s.technique).toFixed(1)), avgTechnique.toFixed(2)],
        ['Creativity', ...entryScores.map(s => Number(s.creativity).toFixed(1)), avgCreativity.toFixed(2)],
        ['Presentation', ...entryScores.map(s => Number(s.presentation).toFixed(1)), avgPresentation.toFixed(2)],
        ['Appearance', ...entryScores.map(s => Number(s.appearance).toFixed(1)), avgAppearance.toFixed(2)]
      ];
      
      const categoryHeaders = ['Category', ...entryScores.map(s => {
        const judgeName = competition?.judge_names?.[s.judge_number - 1];
        // If it's a real name, use initials or first word, otherwise J#
        if (judgeName && !judgeName.startsWith('Judge ')) {
          return judgeName.split(' ')[0].substring(0, 5); // Shorten if too long
        }
        return `J${s.judge_number}`;
      }), 'Avg'];
      
      doc.autoTable({
        startY: yPos,
        head: [categoryHeaders],
        body: categoryRows,
        theme: 'grid',
        headStyles: {
          fillColor: cyanColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          halign: 'center'
        },
        columnStyles: {
          0: { 
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: { left: 6 }
          },
          [categoryHeaders.length - 1]: {
            fillColor: lightGray,
            fontStyle: 'bold',
            textColor: darkGray
          }
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // =============================================================================
      // JUDGE NOTES SECTION
      // =============================================================================
      console.log('📝 Adding judge notes...');
      
      const scoresWithNotes = entryScores.filter(s => s.notes && s.notes.trim());
      if (scoresWithNotes.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setTextColor(...darkGray);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Judge Comments', 14, yPos);
        yPos += 8;
        
        scoresWithNotes.forEach((score, index) => {
          // Check if we need a new page for this note
          if (yPos > pageHeight - 50) {
            doc.addPage();
            yPos = 20;
          }
          
          // Note card background
          const noteText = score.notes.trim();
          const splitNotes = doc.splitTextToSize(noteText, pageWidth - 38);
          const noteHeight = (splitNotes.length * 5) + 15;
          
          doc.setFillColor(255, 251, 235); // yellow-50
          doc.roundedRect(14, yPos, pageWidth - 28, noteHeight, 2, 2, 'F');
          
          // Judge label
          const judgeName = competition?.judge_names?.[score.judge_number - 1] || `Judge ${score.judge_number}`;
          doc.setTextColor(...darkGray);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${judgeName}:`, 18, yPos + 6);
          
          // Notes text
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          doc.text(splitNotes, 18, yPos + 12);
          
          yPos += noteHeight + 6;
        });
        
        yPos += 5;
      }
      
      // =============================================================================
      // MEDAL PROGRAM INFO (if applicable)
      // =============================================================================
      
      if (entry.medal_points > 0 || entry.current_medal_level !== 'None') {
        console.log('🏅 Adding medal program info...');
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(254, 243, 199); // yellow-100
        doc.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, 'F');
        yPos += 8;
        
        doc.setTextColor(146, 64, 14); // yellow-900
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Medal Program Status', 18, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const medalText = entry.current_medal_level && entry.current_medal_level !== 'None'
          ? `Current Level: ${entry.current_medal_level} • Season Points: ${entry.medal_points || 0}`
          : `Season Points: ${entry.medal_points || 0}`;
        doc.text(medalText, 18, yPos);
        
        yPos += 15;
      }
    }
    
    // =============================================================================
    // FOOTER (Championship Style)
    // =============================================================================
    console.log('🦶 Adding footer...');
    
    const footerY = pageHeight - 15;
    
    // Footer line
    doc.setDrawColor(...tealColor);
    doc.setLineWidth(0.5);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('TOPAZ 2.0 © 2025', 14, footerY);
    doc.text('Heritage Since 1972', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Official Competition Results', pageWidth - 14, footerY, { align: 'right' });
    
    // =============================================================================
    // SAVE PDF
    // =============================================================================
    console.log('💾 Saving PDF file...');
    
    const safeName = (entry?.competitor_name || 'Competitor').replace(/[^a-z0-9]/gi, '_');
    const fileName = `TOPAZ_ScoreSheet_Entry${entry?.entry_number || 0}_${safeName}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF generation complete!');
    return { success: true };
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    return { success: false, error: error.message };
  }
};

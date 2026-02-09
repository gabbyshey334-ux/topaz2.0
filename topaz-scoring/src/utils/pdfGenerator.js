import { jsPDF } from 'jspdf';

/**
 * Generate a professional championship-style score sheet PDF
 * MANUAL TABLE IMPLEMENTATION - NO AUTOTABLE DEPENDENCY
 */
export const generateScoreSheet = async (entry, allScores, category, ageDivision, competition) => {
  console.log('🏁 Initializing PDF generation (manual table)...');
  
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    console.log('📐 Document setup:', { pageWidth, pageHeight });
    
    // Colors
    const tealColor = [20, 184, 166];
    const cyanColor = [6, 182, 212];
    const darkGray = [55, 65, 81];
    const lightGray = [243, 244, 246];
    
    let yPos = 0;
    
    // =============================================================================
    // HEADER
    // =============================================================================
    console.log('🏛️ Adding header...');
    
    // Gradient header
    doc.setFillColor(...cyanColor);
    doc.rect(0, 0, pageWidth / 2, 45, 'F');
    doc.setFillColor(...tealColor);
    doc.rect(pageWidth / 2, 0, pageWidth / 2, 45, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('TOPAZ 2.0', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('DANCE COMPETITION', pageWidth / 2, 24, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Score Sheet', pageWidth / 2, 31, { align: 'center' });
    doc.text('Heritage Since 1972', pageWidth / 2, 37, { align: 'center' });
    
    yPos = 55;
    
    // =============================================================================
    // COMPETITION INFO
    // =============================================================================
    console.log('📋 Adding competition info...');
    
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
    
    doc.setFontSize(9);
    doc.text(`${competition?.judges_count || 0} Judges`, 18, yPos);
    
    yPos += 15;
    
    // =============================================================================
    // ENTRY INFORMATION
    // =============================================================================
    console.log('📝 Adding entry information...');
    
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'F');
    yPos += 8;
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Entry Information', 18, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Entry Number: ${entry.entry_number}`, 18, yPos);
    doc.text(`Name: ${entry.competitor_name || 'N/A'}`, 100, yPos);
    yPos += 6;
    
    doc.text(`Category: ${category?.name || 'N/A'}`, 18, yPos);
    doc.text(`Age Division: ${ageDivision?.name || 'N/A'}`, 100, yPos);
    yPos += 6;
    
    doc.text(`Ability Level: ${entry.ability_level || 'N/A'}`, 18, yPos);
    doc.text(`Division Type: ${entry.dance_type || 'N/A'}`, 100, yPos);
    yPos += 6;
    
    if (entry.studio_name) {
      doc.text(`Studio: ${entry.studio_name}`, 18, yPos);
      yPos += 6;
    }
    
    if (entry.teacher_name) {
      doc.text(`Teacher: ${entry.teacher_name}`, 18, yPos);
      yPos += 6;
    }
    
    // Medal program info
    if (entry.is_medal_program) {
      doc.setFillColor(...tealColor);
      doc.roundedRect(18, yPos - 4, 60, 5, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`🏆 Medal Program: ${entry.medal_points || 0} Points • ${entry.current_medal_level || 'None'}`, 20, yPos);
      doc.setTextColor(...darkGray);
      yPos += 6;
    }
    
    yPos += 10;
    
    // =============================================================================
    // SCORES TABLE - MANUAL IMPLEMENTATION
    // =============================================================================
    console.log('📊 Creating scores table manually...');
    
    const entryScores = allScores.filter(s => s.entry_id === entry.id);
    
    if (entryScores.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(200, 0, 0);
      doc.text('No scores available for this entry', pageWidth / 2, yPos, { align: 'center' });
      doc.save(`Entry-${entry.entry_number}-ScoreSheet.pdf`);
      return { success: true };
    }
    
    // Table header
    doc.setFillColor(...tealColor);
    doc.roundedRect(14, yPos, pageWidth - 28, 8, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const colWidths = [25, 30, 30, 35, 30, 30];
    const colPositions = [18];
    for (let i = 1; i < colWidths.length; i++) {
      colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
    }
    
    doc.text('Judge', colPositions[0], yPos + 6);
    doc.text('Technique', colPositions[1], yPos + 6);
    doc.text('Creativity', colPositions[2], yPos + 6);
    doc.text('Presentation', colPositions[3], yPos + 6);
    doc.text('Appearance', colPositions[4], yPos + 6);
    doc.text('Total', colPositions[5], yPos + 6);
    
    yPos += 9;
    
    // Table rows
    doc.setTextColor(...darkGray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let rowIndex = 0;
    entryScores.forEach(score => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(...lightGray);
        doc.rect(14, yPos - 3, pageWidth - 28, 7, 'F');
      }
      
      // Judge name
      const judgeName = competition?.judge_names?.[score.judge_number - 1];
      const judgeLabel = judgeName || `Judge ${score.judge_number}`;
      doc.setFont('helvetica', 'bold');
      doc.text(judgeLabel, colPositions[0], yPos + 4);
      
      // Scores
      doc.setFont('helvetica', 'normal');
      doc.text(score.technique?.toFixed(2) || '0.00', colPositions[1], yPos + 4, { align: 'right' });
      doc.text(score.creativity?.toFixed(2) || '0.00', colPositions[2], yPos + 4, { align: 'right' });
      doc.text(score.presentation?.toFixed(2) || '0.00', colPositions[3], yPos + 4, { align: 'right' });
      doc.text(score.appearance?.toFixed(2) || '0.00', colPositions[4], yPos + 4, { align: 'right' });
      doc.text(score.total_score?.toFixed(2) || '0.00', colPositions[5], yPos + 4, { align: 'right' });
      
      // Row separator
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos + 1, pageWidth - 14, yPos + 1);
      
      yPos += 7;
      rowIndex++;
    });
    
    // Calculate averages
    const avgTechnique = entryScores.reduce((sum, s) => sum + Number(s.technique || 0), 0) / entryScores.length;
    const avgCreativity = entryScores.reduce((sum, s) => sum + Number(s.creativity || 0), 0) / entryScores.length;
    const avgPresentation = entryScores.reduce((sum, s) => sum + Number(s.presentation || 0), 0) / entryScores.length;
    const avgAppearance = entryScores.reduce((sum, s) => sum + Number(s.appearance || 0), 0) / entryScores.length;
    const avgTotal = entryScores.reduce((sum, s) => sum + Number(s.total_score || 0), 0) / entryScores.length;
    
    // Average row
    yPos += 2;
    doc.setFillColor(...cyanColor);
    doc.roundedRect(14, yPos - 3, pageWidth - 28, 8, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('AVERAGE', colPositions[0], yPos + 4);
    doc.text(avgTechnique.toFixed(2), colPositions[1], yPos + 4, { align: 'right' });
    doc.text(avgCreativity.toFixed(2), colPositions[2], yPos + 4, { align: 'right' });
    doc.text(avgPresentation.toFixed(2), colPositions[3], yPos + 4, { align: 'right' });
    doc.text(avgAppearance.toFixed(2), colPositions[4], yPos + 4, { align: 'right' });
    doc.text(avgTotal.toFixed(2), colPositions[5], yPos + 4, { align: 'right' });
    
    yPos += 15;
    
    // =============================================================================
    // TOTAL SCORE SUMMARY
    // =============================================================================
    console.log('🏆 Adding total score summary...');
    
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, yPos, pageWidth - 28, 15, 3, 3, 'F');
    yPos += 8;
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL SCORE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFontSize(24);
    doc.setTextColor(...tealColor);
    doc.text(`${avgTotal.toFixed(2)} / 100`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // =============================================================================
    // FOOTER
    // =============================================================================
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('TOPAZ 2.0 Dance Competition • Heritage Since 1972', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    // =============================================================================
    // SAVE PDF
    // =============================================================================
    console.log('💾 Saving PDF...');
    
    const fileName = `Entry-${entry.entry_number}-${entry.competitor_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'ScoreSheet'}-${competition?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Competition'}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF generated successfully:', fileName);
    return { success: true, fileName };
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  }
};

/**
 * Generate all scorecards for a competition
 */
export const generateAllScorecards = async (entries, allScores, categories, ageDivisions, competition, onProgress) => {
  console.log('🏁 Generating all scorecards...');
  
  try {
    let generated = 0;
    const total = entries.length;
    
    for (const entry of entries) {
      const entryScores = allScores.filter(s => s.entry_id === entry.id);
      if (entryScores.length === 0) {
        console.log(`⏭️  Skipping entry ${entry.entry_number} (no scores)`);
        continue;
      }
      
      const category = categories.find(c => c.id === entry.category_id);
      const ageDivision = ageDivisions.find(d => d.id === entry.age_division_id);
      
      await generateScoreSheet(entry, entryScores, category, ageDivision, competition);
      
      generated++;
      if (onProgress) {
        onProgress({ current: generated, total });
      }
      
      // Small delay to prevent browser from blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Generated ${generated} scorecards`);
    return { success: true, count: generated };
  } catch (error) {
    console.error('❌ Error generating scorecards:', error);
    return { success: false, error: error.message };
  }
};

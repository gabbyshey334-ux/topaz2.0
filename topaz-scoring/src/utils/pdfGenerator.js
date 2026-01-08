import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateScoreSheet = (entry, allScores, competition, categories) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // TOPAZ colors
    const tealColor = [0, 188, 212]; // RGB for #00BCD4
    const darkGray = [60, 60, 60];
    
    let yPos = 20;
    
    // Header - TOPAZ 2.0
    doc.setFillColor(...tealColor);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('TOPAZ 2.0', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Official Score Sheet', pageWidth / 2, 22, { align: 'center' });
    doc.text('Heritage Since 1972', pageWidth / 2, 28, { align: 'center' });
    
    yPos = 45;
    
    // Competition Info
    doc.setTextColor(...darkGray);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(competition.name || 'Competition', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    if (competition.date) {
      doc.text(`Date: ${new Date(competition.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 14, yPos);
      yPos += 5;
    }
    if (competition.venue) {
      doc.text(`Venue: ${competition.venue}`, 14, yPos);
      yPos += 5;
    }
    
    yPos += 5;
    
    // Entry Info Section
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, pageWidth - 28, 35, 'F');
    yPos += 8;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Entry #${entry.entry_number} - ${entry.competitor_name}`, 18, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Category
    const category = categories.find(c => c.id === entry.category_id);
    if (category) {
      doc.text(`Category: ${category.name}`, 18, yPos);
      yPos += 5;
    }
    
    // Ability Level
    if (entry.ability_level) {
      const abilityDescription = {
        'Beginning': 'Beginning (Less than 2 years)',
        'Intermediate': 'Intermediate (2-4 years)',
        'Advanced': 'Advanced (5+ years)'
      };
      doc.text(`Ability Level: ${abilityDescription[entry.ability_level] || entry.ability_level}`, 18, yPos);
      yPos += 5;
    }
    
    // Division type (parse from dance_type)
    if (entry.dance_type) {
      const divisionMatch = entry.dance_type.match(/^([^|]+)/);
      if (divisionMatch) {
        doc.text(`Division: ${divisionMatch[1].trim()}`, 18, yPos);
        yPos += 5;
      }
      
      // Check if medal program
      if (entry.dance_type.includes('Medal: true')) {
        doc.text('⭐ Medal Program Entry', 18, yPos);
        yPos += 5;
        
        // Show medal points and level if any
        if (entry.medal_points > 0 || entry.current_medal_level !== 'None') {
          const medalText = entry.current_medal_level && entry.current_medal_level !== 'None'
            ? `Medal Status: ${entry.current_medal_level} (${entry.medal_points || 0} points)`
            : `Season Points: ${entry.medal_points || 0}`;
          doc.text(medalText, 18, yPos);
          yPos += 5;
        }
      }
    }
    
    // Group members if applicable
    if (entry.dance_type && entry.dance_type.includes('group')) {
      try {
        const membersMatch = entry.dance_type.match(/Members: (\[.*?\])/);
        if (membersMatch) {
          const members = JSON.parse(membersMatch[1]);
          if (members.length > 0) {
            doc.text(`Group Members (${members.length}):`, 18, yPos);
            yPos += 5;
            members.forEach((member, idx) => {
              const memberText = `  ${idx + 1}. ${member.name}${member.age ? ` (${member.age} years)` : ''}`;
              doc.text(memberText, 18, yPos);
              yPos += 4;
            });
            yPos += 3;
          }
        }
      } catch (e) {
        console.error('Error parsing group members:', e);
      }
    }
    
    yPos += 8;
    
    // Scores Table
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Detailed Scores', 14, yPos);
    yPos += 5;
    
    // Filter scores for this entry
    const entryScores = allScores.filter(s => s.entry_id === entry.id);
    
    if (entryScores.length === 0) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text('No scores available for this entry', 14, yPos);
    } else {
      // Create table data
      const tableData = entryScores.map(score => [
        `Judge ${score.judge_number}`,
        score.technique.toFixed(1),
        score.creativity.toFixed(1),
        score.presentation.toFixed(1),
        score.appearance.toFixed(1),
        score.total_score.toFixed(1)
      ]);
      
      // Calculate averages
      const avgTechnique = entryScores.reduce((sum, s) => sum + s.technique, 0) / entryScores.length;
      const avgCreativity = entryScores.reduce((sum, s) => sum + s.creativity, 0) / entryScores.length;
      const avgPresentation = entryScores.reduce((sum, s) => sum + s.presentation, 0) / entryScores.length;
      const avgAppearance = entryScores.reduce((sum, s) => sum + s.appearance, 0) / entryScores.length;
      const avgTotal = entryScores.reduce((sum, s) => sum + s.total_score, 0) / entryScores.length;
      
      tableData.push([
        'AVERAGE',
        avgTechnique.toFixed(2),
        avgCreativity.toFixed(2),
        avgPresentation.toFixed(2),
        avgAppearance.toFixed(2),
        avgTotal.toFixed(2)
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Judge', 'Technique (25)', 'Creativity (25)', 'Presentation (25)', 'Appearance (25)', 'Total (100)']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: tealColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9
        },
        footStyles: {
          fillColor: [200, 200, 200],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { fontStyle: 'bold' }
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Judge Notes Section
      const scoresWithNotes = entryScores.filter(s => s.notes && s.notes.trim());
      if (scoresWithNotes.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Judge Comments', 14, yPos);
        yPos += 7;
        
        scoresWithNotes.forEach(score => {
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.text(`Judge ${score.judge_number}:`, 14, yPos);
          yPos += 5;
          
          doc.setFont(undefined, 'normal');
          const splitNotes = doc.splitTextToSize(score.notes, pageWidth - 28);
          doc.text(splitNotes, 18, yPos);
          yPos += splitNotes.length * 5 + 5;
          
          // Check if we need a new page
          if (yPos > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
    }
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text(
      'TOPAZ 2.0 © 2025 | Heritage Since 1972 | Official Competition Results',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    // Save PDF
    const fileName = `TOPAZ_ScoreSheet_Entry${entry.entry_number}_${entry.competitor_name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    return { success: true };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
};



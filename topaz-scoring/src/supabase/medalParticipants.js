import { supabase } from './config';

/**
 * Get or create a medal participant by name
 * @param {string} participantName - Name of participant
 * @returns {Object} - Participant record
 */
export const getOrCreateParticipant = async (participantName) => {
  try {
    // Normalize name (trim whitespace)
    const normalizedName = participantName.trim();
    
    if (!normalizedName) {
      return { success: false, error: 'Participant name is required' };
    }

    // Try to get existing participant
    const { data: existing, error: fetchError } = await supabase
      .from('medal_participants')
      .select('*')
      .eq('participant_name', normalizedName)
      .single();

    if (existing) {
      return { success: true, data: existing };
    }

    // Create new participant if doesn't exist
    const { data: newParticipant, error: createError } = await supabase
      .from('medal_participants')
      .insert({
        participant_name: normalizedName,
        total_points: 0,
        current_medal_level: 'None'
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('✅ Created new medal participant:', normalizedName);
    return { success: true, data: newParticipant };
  } catch (error) {
    console.error('❌ Error getting/creating participant:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Award medal point to a participant
 * @param {string} participantName - Name of participant
 * @param {string} competitionId - UUID of competition
 * @param {string} entryId - UUID of entry
 * @returns {Object} - Success status
 */
export const awardPointToParticipant = async (participantName, competitionId, entryId) => {
  try {
    const normalizedName = participantName.trim();

    // Get or create participant
    const participantResult = await getOrCreateParticipant(normalizedName);
    if (!participantResult.success) {
      throw new Error(participantResult.error);
    }

    const participant = participantResult.data;

    // Check if award already exists (prevent duplicates)
    const { data: existingAward } = await supabase
      .from('medal_awards')
      .select('id')
      .eq('competition_id', competitionId)
      .eq('entry_id', entryId)
      .eq('participant_name', normalizedName)
      .single();

    if (existingAward) {
      console.log('⚠️ Award already exists for', normalizedName, 'entry', entryId);
      return { success: true, data: participant, alreadyAwarded: true };
    }

    // Create medal award record
    const { error: awardError } = await supabase
      .from('medal_awards')
      .insert({
        competition_id: competitionId,
        entry_id: entryId,
        participant_name: normalizedName,
        points_awarded: 1
      });

    if (awardError) throw awardError;

    // Update participant points
    const newTotalPoints = participant.total_points + 1;
    
    // Determine medal level
    let medalLevel = 'None';
    if (newTotalPoints >= 50) {
      medalLevel = 'Gold';
    } else if (newTotalPoints >= 35) {
      medalLevel = 'Silver';
    } else if (newTotalPoints >= 25) {
      medalLevel = 'Bronze';
    }

    // Update participant
    const { data: updatedParticipant, error: updateError } = await supabase
      .from('medal_participants')
      .update({
        total_points: newTotalPoints,
        current_medal_level: medalLevel
      })
      .eq('id', participant.id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`✅ Awarded point to ${normalizedName}: ${newTotalPoints} points (${medalLevel})`);
    return { success: true, data: updatedParticipant };
  } catch (error) {
    console.error('❌ Error awarding point:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Award medal points for a single entry (handles solos and groups)
 * @param {Object} entry - Entry object with competitor_name and group_members
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Success status with awards details
 */
export const awardMedalPointsForEntry = async (entry, competitionId) => {
  try {
    const awards = [];

    // Determine if group
    const isGroup = entry.dance_type && !entry.dance_type.toLowerCase().includes('solo');

    if (isGroup && entry.group_members && entry.group_members.length > 0) {
      // Award point to EACH group member
      for (const member of entry.group_members) {
        if (member.name && member.name.trim()) {
          const result = await awardPointToParticipant(
            member.name,
            competitionId,
            entry.id
          );
          if (result.success && !result.alreadyAwarded) {
            awards.push({
              name: member.name,
              points: result.data.total_points,
              level: result.data.current_medal_level
            });
          }
        }
      }
    } else {
      // Award point to solo performer
      const result = await awardPointToParticipant(
        entry.competitor_name,
        competitionId,
        entry.id
      );
      if (result.success && !result.alreadyAwarded) {
        awards.push({
          name: entry.competitor_name,
          points: result.data.total_points,
          level: result.data.current_medal_level
        });
      }
    }

    return { success: true, awards };
  } catch (error) {
    console.error('❌ Error awarding medal points for entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Award medal points for all 1st place medal program entries in a competition
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Success status with summary
 */
export const awardMedalPointsForCompetition = async (competitionId) => {
  try {
    console.log('🏅 Starting medal point awards for competition:', competitionId);

    // Get all entries with their scores
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select(`
        id,
        competitor_name,
        dance_type,
        is_medal_program,
        group_members,
        scores (
          total_score,
          average_score
        )
      `)
      .eq('competition_id', competitionId)
      .eq('is_medal_program', true);

    if (entriesError) throw entriesError;

    if (!entries || entries.length === 0) {
      return { success: true, message: 'No medal program entries found', totalAwarded: 0 };
    }

    // Group entries by category/division for ranking
    // For simplicity, we'll get rankings from scores table
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select(`
        entry_id,
        total_score,
        average_score,
        entries!inner (
          id,
          competitor_name,
          dance_type,
          is_medal_program,
          group_members,
          category_id,
          age_division_id,
          ability_level,
          dance_type
        )
      `)
      .eq('entries.competition_id', competitionId)
      .eq('entries.is_medal_program', true)
      .order('average_score', { ascending: false });

    if (scoresError) throw scoresError;

    // Group by category/age/ability/division to determine 1st place
    const groupedEntries = {};
    
    for (const score of allScores) {
      const entry = score.entries;
      const key = `${entry.category_id}_${entry.age_division_id}_${entry.ability_level}_${entry.dance_type}`;
      
      if (!groupedEntries[key]) {
        groupedEntries[key] = [];
      }
      
      groupedEntries[key].push({
        ...entry,
        averageScore: score.average_score
      });
    }

    // Find 1st place in each group
    const firstPlaceEntries = [];
    for (const key in groupedEntries) {
      const group = groupedEntries[key];
      // Sort by score descending
      group.sort((a, b) => b.averageScore - a.averageScore);
      // First entry is 1st place
      if (group.length > 0) {
        firstPlaceEntries.push(group[0]);
      }
    }

    console.log(`Found ${firstPlaceEntries.length} first place medal program entries`);

    // Award points for each first place entry
    let totalParticipantsAwarded = 0;
    const awardSummary = [];

    for (const entry of firstPlaceEntries) {
      const result = await awardMedalPointsForEntry(entry, competitionId);
      if (result.success && result.awards) {
        totalParticipantsAwarded += result.awards.length;
        awardSummary.push({
          entry: entry.competitor_name,
          awards: result.awards
        });
      }
    }

    console.log(`✅ Medal points awarded to ${totalParticipantsAwarded} participants`);

    return {
      success: true,
      totalAwarded: totalParticipantsAwarded,
      firstPlaceCount: firstPlaceEntries.length,
      summary: awardSummary
    };
  } catch (error) {
    console.error('❌ Error awarding medal points for competition:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get season leaderboard (top participants)
 * @param {number} limit - Number of participants to return (default 20)
 * @returns {Object} - Leaderboard data
 */
export const getSeasonLeaderboard = async (limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('medal_participants')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Calculate points to next level for each participant
    const leaderboard = data.map((participant, index) => {
      let pointsToNext = 0;
      let nextLevel = '';

      if (participant.current_medal_level === 'None') {
        pointsToNext = 25 - participant.total_points;
        nextLevel = 'Bronze';
      } else if (participant.current_medal_level === 'Bronze') {
        pointsToNext = 35 - participant.total_points;
        nextLevel = 'Silver';
      } else if (participant.current_medal_level === 'Silver') {
        pointsToNext = 50 - participant.total_points;
        nextLevel = 'Gold';
      } else {
        pointsToNext = 0;
        nextLevel = 'Gold (Max)';
      }

      return {
        ...participant,
        rank: index + 1,
        pointsToNext,
        nextLevel
      };
    });

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error('❌ Error fetching season leaderboard:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get medal awards for a specific competition
 * @param {string} competitionId - UUID of competition
 * @returns {Object} - Awards data
 */
export const getCompetitionMedalAwards = async (competitionId) => {
  try {
    const { data, error } = await supabase
      .from('medal_awards')
      .select(`
        *,
        entries (
          competitor_name,
          dance_type,
          category_id,
          age_division_id
        )
      `)
      .eq('competition_id', competitionId)
      .order('awarded_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('❌ Error fetching competition medal awards:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get participant details including all their awards
 * @param {string} participantName - Name of participant
 * @returns {Object} - Participant data with awards history
 */
export const getParticipantDetails = async (participantName) => {
  try {
    const { data: participant, error: participantError } = await supabase
      .from('medal_participants')
      .select('*')
      .eq('participant_name', participantName)
      .single();

    if (participantError) throw participantError;

    const { data: awards, error: awardsError } = await supabase
      .from('medal_awards')
      .select(`
        *,
        entries (
          competitor_name,
          dance_type
        ),
        competitions (
          name,
          date
        )
      `)
      .eq('participant_name', participantName)
      .order('awarded_at', { ascending: false });

    if (awardsError) throw awardsError;

    return {
      success: true,
      data: {
        ...participant,
        awards
      }
    };
  } catch (error) {
    console.error('❌ Error fetching participant details:', error);
    return { success: false, error: error.message };
  }
};




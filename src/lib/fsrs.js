import { fsrs, generatorParameters, createEmptyCard, Rating, State } from 'ts-fsrs';

let scheduler = null;

function getScheduler(params = {}) {
  if (!scheduler) {
    const p = generatorParameters({
      request_retention: params.requestRetention || 0.9,
      maximum_interval: params.maximumInterval || 36500,
      enable_fuzz: params.enableFuzz !== false,
    });
    scheduler = fsrs(p);
  }
  return scheduler;
}

export function resetScheduler() {
  scheduler = null;
}

/**
 * Create initial FSRS state for a new card.
 */
export function initCardState() {
  const card = createEmptyCard();
  return {
    fsrsState: 'new',
    fsrsStability: card.stability,
    fsrsDifficulty: card.difficulty,
    fsrsDue: card.due.toISOString(),
    fsrsLastReview: null,
    fsrsReps: card.reps,
    fsrsLapses: card.lapses,
    fsrsElapsedDays: card.elapsed_days,
    fsrsScheduledDays: card.scheduled_days,
  };
}

/**
 * Convert our card fields to a ts-fsrs Card object.
 */
function toFsrsCard(cardFields) {
  const stateMap = { new: State.New, learning: State.Learning, review: State.Review, relearning: State.Relearning };
  return {
    due: new Date(cardFields.fsrsDue || Date.now()),
    stability: cardFields.fsrsStability || 0,
    difficulty: cardFields.fsrsDifficulty || 0,
    elapsed_days: cardFields.fsrsElapsedDays || 0,
    scheduled_days: cardFields.fsrsScheduledDays || 0,
    reps: cardFields.fsrsReps || 0,
    lapses: cardFields.fsrsLapses || 0,
    state: stateMap[cardFields.fsrsState] ?? State.New,
    last_review: cardFields.fsrsLastReview ? new Date(cardFields.fsrsLastReview) : undefined,
  };
}

/**
 * Rate a card and get updated FSRS fields.
 * @param {Object} cardFields - Our card's FSRS fields
 * @param {'again'|'hard'|'good'|'easy'} rating - User rating
 * @param {Object} params - FSRS parameters from settings
 * @returns {Object} Updated FSRS fields
 */
export function rateCard(cardFields, rating, params = {}) {
  const ratingMap = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };
  const s = getScheduler(params);
  const card = toFsrsCard(cardFields);
  const now = new Date();

  const result = s.next(card, now, ratingMap[rating]);
  const updated = result.card;
  const stateNames = { [State.New]: 'new', [State.Learning]: 'learning', [State.Review]: 'review', [State.Relearning]: 'relearning' };

  return {
    fsrsState: stateNames[updated.state] || 'new',
    fsrsStability: updated.stability,
    fsrsDifficulty: updated.difficulty,
    fsrsDue: updated.due.toISOString(),
    fsrsLastReview: now.toISOString(),
    fsrsReps: updated.reps,
    fsrsLapses: updated.lapses,
    fsrsElapsedDays: updated.elapsed_days,
    fsrsScheduledDays: updated.scheduled_days,
  };
}

export { Rating, State };

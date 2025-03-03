export const THREE_STAR_REVIEW = ["The lemonade was perfect!", "I loved the lemonade!", "The lemonade was great!"];

export const TWO_STAR_REVIEW = ["The lemonade was okay.", "The lemonade was fine."];

export const ONE_STAR_REVIEW = ["The lemonade was bad.", "I didn't like the lemonade."];

export const ZERO_STAR_REVIEW = ["The lemonade was terrible.", "I hated the lemonade."];

export const TOO_EXPENSIVE_REVIEW = ["The lemonade was too expensive.", "The lemonade was overpriced."];

export const TOO_LONG_QUEUE_REVIEW = ["The queue was too long.", "The queue was too slow."];

export const getReviewsByStar = (star: number): string[] => {
    switch (star) {
        case 1:
            return ONE_STAR_REVIEW;
        case 2:
            return TWO_STAR_REVIEW;
        case 3:
            return THREE_STAR_REVIEW;
        case 0:
            return ZERO_STAR_REVIEW;
        default:
            return [];
    }
};

export const getTooExpensiveReview = () => {
    return Phaser.Math.RND.pick(TOO_EXPENSIVE_REVIEW);
};

export const getTooLongQueueReview = () => {
    return Phaser.Math.RND.pick(TOO_LONG_QUEUE_REVIEW);
};

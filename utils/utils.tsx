export function memoryCurve(repeat: number): number {
  if (repeat === 0) {
    return 0
  } else if (repeat === 1) {
    return 1
  } else if (repeat === 2) {
    return 6
  } else {
    return memoryCurve(repeat - 1) * 2
  }
}
export const getNextReviewTime = (lastReviewed: number, repeat: number) => {
  return lastReviewed + memoryCurve(repeat) * 24 * 60 * 60 * 1000
}

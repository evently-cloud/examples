/**
 * Measures performance using node's performance hooks.
 */
export class PerformanceMeasure {
  readonly #durations = new Map<string, number[]>()

  start(tag: string) {
    performance.mark(`${tag}:start`)
  }

  end(tag: string) {
    const startMark = `${tag}:start`
    const endMark = `${tag}:end`
    const measureName = `${tag}:duration`

    performance.mark(endMark)
    const measure = performance.measure(measureName, startMark, endMark)

    const durations = this.#durations.get(tag) ?? []
    durations.push(measure.duration)
    this.#durations.set(tag, durations)

    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
    performance.clearMeasures(measureName)
  }

  print() {
    console.table(
      [...this.#durations.entries()].map(([tag, durations]) => {
        const total = durations.reduce((sum, duration) => sum + duration, 0)
        const average = total / durations.length
        const min = Math.min(...durations)
        const max = Math.max(...durations)

        return {
          tag,
          count: durations.length,
          "total ms": Number(total.toFixed(2)),
          "avg ms": Number(average.toFixed(2)),
          "min ms": Number(min.toFixed(2)),
          "max ms": Number(max.toFixed(2))
        }
      })
    )
  }
}

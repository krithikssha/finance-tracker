function SpendingBreakdown({ transactions }) {
  const categories = [
    'food',
    'travel',
    'shopping',
    'education',
    'other'
  ]

  const spending = categories.map(
    category => {

      const total = transactions
        .filter(
          transaction =>
            transaction.type ===
              'expense' &&
            transaction.category ===
              category
        )
        .reduce(
          (sum, transaction) =>
            sum + transaction.amount,
          0
        )

      return {
        category,
        total
      }
    }
  )

  const maxValue = Math.max(
    ...spending.map(
      item => item.total
    ),
    100
  )

  const chartWidth = 800
  const chartHeight = 300

  const paddingLeft = 55
  const paddingRight = 25
  const paddingTop = 25
  const paddingBottom = 55

  const graphWidth =
    chartWidth -
    paddingLeft -
    paddingRight

  const graphHeight =
    chartHeight -
    paddingTop -
    paddingBottom

  const points = spending.map(
    (item, index) => {

      const x =
        paddingLeft +
        (index /
          (categories.length - 1)) *
          graphWidth

      const y =
        paddingTop +
        graphHeight -
        (item.total /
          maxValue) *
          graphHeight

      return {
        ...item,
        x,
        y
      }
    }
  )

  const linePoints = points
    .map(
      point =>
        `${point.x},${point.y}`
    )
    .join(' ')

  const gridLines = [
    0,
    25,
    50,
    75,
    100
  ]

  return (
    <div className="spending-breakdown">

      <div className="chart-header">

        <div>

          <h2>
            Spending Breakdown
          </h2>

          <p>
            Expenses by category
          </p>

        </div>

      </div>

      <div className="line-chart">

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >

          {gridLines.map(
            value => {

              const y =
                paddingTop +
                graphHeight -
                (value / 100) *
                  graphHeight

              return (
                <line
                  key={value}
                  x1={paddingLeft}
                  y1={y}
                  x2={
                    chartWidth -
                    paddingRight
                  }
                  y2={y}
                  className="chart-grid-line"
                />
              )
            }
          )}

          {gridLines.map(
            value => {

              const amount =
                Math.round(
                  (value / 100) *
                    maxValue
                )

              const y =
                paddingTop +
                graphHeight -
                (value / 100) *
                  graphHeight

              return (
                <text
                  key={value}
                  x="5"
                  y={y + 4}
                  className="chart-y-label"
                >
                  ₹{amount}
                </text>
              )
            }
          )}

          <polyline
            points={linePoints}
            className="chart-line"
            fill="none"
          />

          {points.map(
            point => (
              <g
                key={point.category}
              >

                <circle
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  className="chart-point-outer"
                />

                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  className="chart-point-inner"
                />

                <text
                  x={point.x}
                  y={
                    chartHeight - 18
                  }
                  textAnchor="middle"
                  className="chart-x-label"
                >
                  {point.category}
                </text>

              </g>
            )
          )}

        </svg>

      </div>

      <div className="chart-values">

        {spending.map(
          item => (
            <div
              className="chart-value"
              key={item.category}
            >

              <span>
                {item.category}
              </span>

              <strong>
                ₹{item.total}
              </strong>

            </div>
          )
        )}

      </div>

    </div>
  )
}

export default SpendingBreakdown
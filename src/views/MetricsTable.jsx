import React from 'react';
import ReactJson from 'react-json-view';

const MetricRow = ({metric}) => {
  return (
    <tr>
      <td style={{wordBreak: 'break-all'}}>{metric.name}</td>
      <td>
        <ReactJson
          src={metric}
          iconStyle='triangle'
          displayDataTypes={false}
          collapsed />
      </td>
    </tr>
  )
};

class MetricsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: ''
    };
    this.handleFilter = this.handleFilter.bind(this);
  }

  handleFilter(event) {
    this.setState({filter: event.target.value});
  }

  render() {
    const {metrics} = this.props;
    const {filter} = this.state;
    if (!metrics) return null;

    let filteredMetrics = metrics;
    if (filter.length) {
      filteredMetrics = metrics.filter((metric) => metric.name.indexOf(filter) > -1);
    }

    return (
      <div>
        <div>
          <input
            className='form-control'
            onChange={this.handleFilter} />
        </div>
        <br />
        <table className='table'>
          <thead>
            <tr>
              <th>Metric Key</th>
              <th>Raw</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.reverse().map((metric) => <MetricRow metric={metric} />)}
          </tbody>
        </table>
      </div>
    )
  }
}

export default MetricsTable;

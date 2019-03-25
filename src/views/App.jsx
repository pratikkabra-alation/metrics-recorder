import React from 'react';
import MetricsTable from './MetricsTable.jsx';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isRecording: false,
      tabId: null,
      metrics: null
    }
    this.getStateFromBackground = this.getStateFromBackground.bind(this);
    this.sendBackgroundMessage = this.sendBackgroundMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.setUpdateInterval = this.setUpdateInterval.bind(this);
    this.clearUpdateInterval = this.clearUpdateInterval.bind(this);
  }

  componentDidMount() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
      this.setState({tabId: tab[0].id}, () => {
        this.getStateFromBackground();
        this.sendBackgroundMessage('get_is_capturing', (response) => {
          if (!!response.results) this.setUpdateInterval();
        });
      });
    });
  }

  componentWillUnmount() {
    this.clearUpdateInterval();
  }

  getStateFromBackground() {
    this.sendBackgroundMessage('get_is_capturing', (response) => {
      this.setState({isRecording: !!response.results});
    });
    this.sendBackgroundMessage('get_metrics', (response) => {
      this.setState({metrics: response.results});
    });
  }

  sendBackgroundMessage(message, callback = () => {}) {
    const tabId = this.state.tabId;
    chrome.runtime.sendMessage({
      alation_metrics_ext_event: message,
      alation_metrics_ext_window: tabId
    }, callback);
  }

  setUpdateInterval() {
    this.updateInterval = setInterval(() => {
      this.getStateFromBackground();
    }, 500);
  }

  clearUpdateInterval() {
    clearInterval(this.updateInterval);
  }

  handleClick() {
    if (this.state.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    this.setState({isRecording: true});
    this.sendBackgroundMessage('clear_capture');
    this.sendBackgroundMessage('start_capture');
    this.setUpdateInterval();
  }

  stopRecording() {
    this.setState({isRecording: false});
    this.clearUpdateInterval();
    this.sendBackgroundMessage('stop_capture');
    this.getStateFromBackground();
  }

  handleClear() {
    this.sendBackgroundMessage('clear_capture');
    this.getStateFromBackground();
  }

  render() {
    const {isRecording, metrics} = this.state;
    const containerStyles = {
      width: '570px',
      padding: '20px',
      maxHeight: '500px',
      overflowY: 'scroll'
    };

    return (
      <div className='container' style={containerStyles}>
        <div className='row'>
          <div className='col-12'>
            <button
              type='button'
              className={'btn ' + (isRecording ? 'btn-danger' : 'btn-primary')}
              onClick={this.handleClick}>
              {isRecording ? 'Stop' : 'Record'}
            </button>
            <button
              type='button'
              className={'btn'}
              onClick={this.handleClear}>
              Clear
            </button>
            <br />
            <br />
          </div>
        </div>
        <hr />
        <div className='row'>
          <div className='col-12'>
            {metrics && metrics.length ? <MetricsTable metrics={metrics} /> : 'No Metrics Recorded'}
          </div>
        </div>
      </div>
    )
  }
}

export default App;

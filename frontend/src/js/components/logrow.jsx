var React = require('react');
var moment = require('moment');

module.exports = LogRow = React.createClass({
    render: function () {
        var event = this.props.event;
        return <tr>
            <td>{event.application.toLowerCase()}</td>
            <td>{event.environment.toUpperCase()}</td>
            <td>{event.deployer}</td>
            <td>{event.version}</td>
            <td>{moment(event.timestamp).format('DD-MM-YY HH:mm:ss')}</td>
        </tr>
    }
});

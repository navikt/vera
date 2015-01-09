var React = require('react');
var moment = require('moment');

module.exports = LogRow = React.createClass({
    render: function () {
        var event = this.props.event;
        return <tr>
            <td>{event.application}</td>
            <td>{event.environment}</td>
            <td>{event.deployer}</td>
            <td>{event.version}</td>
            <td>{moment(event.timestamp).format('DD-MM-YY HH:mm:ss')}</td>
        </tr>
    }
});

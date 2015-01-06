var React = require('react');

module.exports = LogRow = React.createClass({
    render: function(){
        var event = this.props.event;
        return <tr><td>{event.application}</td><td>{event.environment}</td><td>{event.deployer}</td><td>{event.version}</td></tr>
    }
});

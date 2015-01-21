var React = require('react/addons');

module.exports = LogRow = React.createClass({
    render: function () {
        var event = this.props.event;
        var newVersionAsterisk = React.addons.classSet({
            "fa": true,
            "fa-asterisk": true,
            "hidden": !this.props.event.latest
        });

        return <tr>
            <td>{event.application.toLowerCase()}</td>
            <td>{event.environment.toUpperCase()}</td>
            <td>{event.deployer}</td>
            <td>{event.version} <small><sup><i className={newVersionAsterisk}></i></sup></small></td>
            <td>{event.timestamp}</td>
        </tr>
    }
});

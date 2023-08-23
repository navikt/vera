var React = require('react');
var classString = require('react-classset');
var moment = require('moment');

module.exports = LogRow = React.createClass({
    render: function () {
        var event = this.props.event;

        return <tr>
            <td>{event.application.toLowerCase()}</td>
            <td>{event.environment.toUpperCase()}</td>
            <td>{event.deployer}</td>
            <td><i className={this.undeployedIcon()}></i> {event.version}
                <small>
                    <sup>
                        <i className={this.newVersionAsterisk()}></i>
                    </sup>
                </small>
            </td>
            <td >{event.deployed_timestamp}</td>
            <td>{moment(event.original_timestamp).fromNow()}</td>
        </tr>
    },

    newVersionAsterisk: function () {
        return classString({
            "fa": true,
            "fa-asterisk": true,
            "hidden": this.props.event.replaced_timestamp
        })
    },

    undeployedIcon: function() {
        return classString({
            "fa": true,
            "fa-trash-o": true,
            "hidden": this.props.event.version !== 'undeployed'
        })
    }
});

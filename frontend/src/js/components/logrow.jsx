var React = require('react');
var classString = require('react-classset');

module.exports = LogRow = React.createClass({
    render: function () {
        var event = this.props.event;

        return <tr>
            <td>{event.application.toLowerCase()}</td>
            <td>{event.environment.toUpperCase()}</td>
            <td>{event.deployer}</td>
            <td>{event.version}
                <small>
                    <sup>
                        <i className={this.newVersionAsterisk()}></i>
                    </sup>
                </small>
            </td>
            <td>{event.deployed_timestamp}</td>
        </tr>
    },

    newVersionAsterisk: function () {
        return classString({
            "fa": true,
            "fa-asterisk": true,
            "hidden": this.props.event.replaced_timestamp
        })
    }
});

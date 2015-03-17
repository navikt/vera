var React = require('react');
var classString = require('react-classset');

module.exports = LogHeader = React.createClass({
    render: function () {
        var event = this.props.event;

        return <th>
            <div className={this.regexValidationClasses("application")}>
                <input id="application" type="text" className="form-control input-sm" placeholder="application" value={this.state.filters.application}  onChange={this.handleChange} />
            </div>
        </th>
    },

    regexValidationClasses: function (field) {
        return classString({
            "has-success": this.state.filters.regexMode && this.isValidRegex(this.state.filters[field]),
            "has-error": this.state.filters.regexMode && !this.isValidRegex(this.state.filters[field])
        })
    },

    isValidRegex: function (expression) {
        try {
            new RegExp("^" + expression + "$");
            return true;
        } catch (e) {
            return false;
        }
    }

});

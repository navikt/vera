var React = require('react');
var classString = require('react-classset');

module.exports = LogHeader = React.createClass({



    render: function () {
        return <th>
            <div className={this.regexValidationClasses()}>
                <input ref={this.props.columnName} id={this.props.columnName} type="text" className="form-control input-sm" value={this.props.value} placeholder={this.props.columnName} onChange={this.props.changeHandler} />
            </div>
        </th>
    },

    regexValidationClasses: function () {
        var filterValue = this.props.value || '';

        var isValidRegex = function (expression) {
            try {
                new RegExp("^" + expression + "$");
                return true;
            } catch (e) {
                return false;
            }
        }

        return classString({
            "has-success": this.props.regexp && isValidRegex(filterValue),
            "has-error": this.props.regexp && !isValidRegex(filterValue)
        })
    }
});

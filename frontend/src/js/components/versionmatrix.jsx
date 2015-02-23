var React = require('react');
var util = require('../../vera-parser');
var $ = jQuery = require('jquery');
var MatrixRow = require('./matrixrow.jsx');


module.exports = VersionMatrix = React.createClass({
    getInitialState: function () {
        return {
            loaded: false,
            rowsToRender: 20,
            jsonData: [],
            filters: {}
        }
    },

    componentDidMount: function () {
        $.getJSON('/cv').done(function (data) {
            this.setState({jsonData: data});
        }.bind(this));
    },

    componentDidUpdate: function () {
        //console.log('Hitting')
        if (!this.state.loaded) {
            console.log('Stop spinning');
            this.setState({loaded: true});
        }
    },

    updateFilters: function (e) {
        var filters = {
            application: this.refs.applicationFilter.getDOMNode().value.toLowerCase(),
            environment: this.refs.environmentFilter.getDOMNode().value.toLowerCase()
        };

        if (this.refs.newDeployments.getDOMNode().checked) {
            filters.newDeployment = true;
        }

        this.setState({filters: filters});
        if (e.target.type === 'submit') { // prevent form submission, no need to call the server as everything happens client side
            e.preventDefault();
        }
    },

    applyFilters: function () {
        var filters = this.state.filters;

        var isElementIn = function (filterString, element, property) {
            var filterTokens = filterString.split(",");
            for (var i = 0; i < filterTokens.length; i++) {
                if (element[property].toLowerCase().indexOf(filterTokens[i].trim()) > -1) {
                    return true;
                }
            }
            return false;
        }

        var applyFilter = function (inputData, filterString, filterProperty) {
            if (typeof filterString === 'boolean') {
                return filteredJsonData.filter(function (elem) {
                    return elem[filterProperty] === true;
                });

            }
            else {
                return filteredJsonData.filter(function (elem) {
                    return isElementIn(filters[filterProperty], elem, filterProperty);
                });
            }
        }

        var filteredJsonData = this.state.jsonData;

        if (filters) {
            var keys = Object.keys(filters);
            keys.forEach(function (filterProperty) {
                filteredJsonData = applyFilter(filteredJsonData, filters[filterProperty], filterProperty);
            });
        }

        return util.buildVersionMatrix(filteredJsonData);
    },

    clear: function (e) {
        this.refs.applicationFilter.getDOMNode().value = '';
        this.refs.applicationFilter.getDOMNode().value = '';
        var currentFilters = this.state.filters;
        delete currentFilters.application;
        delete currentFilters.environment;
        this.setState({filters: currentFilters});
    },

    viewAllRows: function () {
        this.setState({loaded: false})

        console.log('Should trigger a rerender... '  + util.countRows(this.state.jsonData))
        this.setState({rowsToRender: rowCount})
        console.log('Reloading...')
    },

    render: function () {
        console.log("This is filters in Render ", this.state.filters)

        var filteredData = this.applyFilters();
        var headers = filteredData.header;
        var body = filteredData.body.slice(0, this.state.rowsToRender);

        var cx = React.addons.classSet;
        var toggle = cx({
            "btn": true,
            "btn-default": true,
            "active": this.state.filters.newDeployment

        });

        var spinnerClasses = cx({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': this.state.loaded
        });

        var showMoreLink;

        if (this.state.rowsToRender < filteredData.body.length) {
            showMoreLink = (
                <div>
                    <button type="button" className="btn btn-link" onClick={this.viewAllRows()}>View all...</button>
                </div>
            )
        }
        console.dir(spinnerClasses);
        console.dir(this.state)

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <form className="form-inline">
                                <div>
                                    <div className="form-group">
                                        <div className="form-group">
                                            <input ref="applicationFilter" type="text" className="form-control" active placeholder="applications"></input>
                                        </div>
                                        <div className="form-group">
                                            <input ref="environmentFilter" type="text" className="form-control" placeholder="environments"></input>
                                        </div>
                                        <input type="submit" className="btn btn-default" onClick={this.updateFilters} value="Apply" />
                                        <input type="button" className="btn btn-danger" onClick={this.clear} value="Clear" />
                                    </div>
                                    <div className="btn-group pull-right" data-toggle="buttons" role="group">
                                        <label className={toggle} >
                                            <input ref="newDeployments" type="checkbox" autoComplete="off" onClick={this.updateFilters} />
                                        last 24 hrs
                                        </label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        u</label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        t
                                        </label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        q
                                        </label>
                                        <label className="btn btn-default">
                                            <input type="checkbox" autoComplete="off" />
                                        p
                                        </label>
                                    </div>
                                 </div>
                            </form>
                        </div>
                    </div>
                </div>

                <table ref = "thematrix" className = "table table-bordered table-striped">
                    <thead>
                        <tr>
                        {headers.map(function (header) {
                            return <th key={header}>{header.toUpperCase()}</th>
                        })}
                        </tr>
                    </thead>
                    < tbody >
                        {body.map(function (row) {
                            return <MatrixRow key={row[0]} rowObject={row}/>
                        })
                            }
                    </tbody>
                </table>
                <div>
                    {showMoreLink}
                    <i className={spinnerClasses}></i>
                </div>
            </div >
        )
    }
});
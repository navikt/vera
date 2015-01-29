var React = require('react/addons');
var $ = require('jquery');
var Router = require('react-router');
var LogRow = require('./logrow.jsx');

module.exports = DeployLog = React.createClass({

    mixins: [Router.State],

    getInitialState: function () {
        return {
            items: [],
            loaded: false,
            itemRenderCount: 50,
            applicationFilter: '',
            environmentFilter: '',
            deployerFilter: '',
            versionFilter: '',
            deployedTimestampFilter: '',
            onlyCurrentVersions: false
        };
    },

    handleChange: function (e) {
        this.state[e.target.id] = e.target.value
        this.setState(this.state);
    },

    componentDidMount: function () {
        var queryParams = [];

        var appQueryParam = this.getQuery().app;
        if (appQueryParam) {
            queryParams.push("app=" + appQueryParam);
            this.setState({applicationFilter: appQueryParam});
        }

        var envQueryParam = this.getQuery().env;
        if (envQueryParam) {
            queryParams.push("env=" + envQueryParam);
            this.setState({environmentFilter: envQueryParam});
        }

        $.getJSON('/version?last=1month').done(function (data) {
            this.setState({items: data})
            $.getJSON('/version?' + queryParams.join("&")).done(function (data) {
                this.setState({items: data, loaded: true})
            }.bind(this));
        }.bind(this));

    },

    viewMoreResults: function () {
        this.setState({itemRenderCount: this.state.itemRenderCount + 50})
    },

    toggleCurrentVersionFilter: function () {
        this.setState({onlyCurrentVersions: !this.state.onlyCurrentVersions});
    },

    render: function () {
        var applicationFilter = this.state.applicationFilter.toLowerCase();
        var environmentFilter = this.state.environmentFilter.toLowerCase();
        var deployerFilter = this.state.deployerFilter.toLowerCase();
        var versionFilter = this.state.versionFilter.toLowerCase();
        var deployedTimestampFilter = this.state.deployedTimestampFilter.toLowerCase();
        var onlyCurrentVersions = this.state.onlyCurrentVersions;

        var tableHeaderFilter = function (elem) {
            var application = elem.application.toLowerCase();
            var environment = elem.environment.toLowerCase();
            var deployer = elem.deployer.toLowerCase();
            var version = elem.version.toLowerCase();
            var deployedTimestamp = elem.deployed_timestamp.toString().toLowerCase();

            return application.indexOf(applicationFilter) > -1
                && environment.indexOf(environmentFilter) > -1
                && deployer.indexOf(deployerFilter) > -1
                && version.indexOf(versionFilter) > -1
                && deployedTimestamp.indexOf(deployedTimestampFilter) > -1;
        }

        var onlyCurrentVersionsIfEnabled = function (elem) {
            if (!onlyCurrentVersions) {
                return true;
            } else {
                return elem.replaced_timestamp === "";
            }
        };

        var filteredEvents = this.state.items.filter(tableHeaderFilter).filter(onlyCurrentVersionsIfEnabled);
        var eventsToRender = filteredEvents.slice(0, this.state.itemRenderCount);
        var cx = React.addons.classSet;

        var spinnerClasses = cx({
            'fa': true,
            'fa-spinner': true,
            'fa-spin': true,
            'hidden': this.state.loaded
        });

        var currentVersionToggleClasses = cx({
            "btn": true,
            "btn-default": true,
            "btn-sm": true,
            /*"vera-filter": true,*/
            "active": this.state.onlyCurrentVersions
        });

        return (
            <div className="container">
                        <h2>events
                            <small>  {filteredEvents.length + "/" + this.state.items.length}
                                <i className={spinnerClasses}></i>
                            </small>
                            <div className="pull-right" data-toggle="buttons" role="group">
                                <label className={currentVersionToggleClasses} >
                                    <input ref="bauer" type="checkbox" autoComplete="off" onClick={this.toggleCurrentVersionFilter} />
                                current apps
                                </label>
                            </div>
                        </h2>

                <table className='table table-bordered table-striped'>
                    <tr>
                        <th>
                            <input id="applicationFilter" className="form-control" placeholder="application" value={this.state.applicationFilter} type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="environmentFilter" className="form-control" placeholder="environment" value={this.state.environmentFilter} type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="deployerFilter" className="form-control" placeholder="deployer" type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="versionFilter" className="form-control" placeholder="version" type="text" onChange={this.handleChange} />
                        </th>
                        <th>
                            <input id="deployedTimestampFilter" className="form-control" placeholder="deployed" type="text" onChange={this.handleChange} />
                        </th>
                    </tr>
                    <tbody>
                        {eventsToRender.map(function (elem) {
                            return <LogRow key={elem.id} event={elem} />
                        })}
                    </tbody>
                </table>
                <button type="button" className="btn btn-link" onClick={this.viewMoreResults}>View more results...</button>
            </div>
        )
    }
});





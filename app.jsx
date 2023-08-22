var React = require('react');
var $ = jQuery = require('jquery');
var VersionMatrix = require('./frontend/src/js/components/versionmatrix.jsx');
var DeployLog = require('./frontend/src/js/components/deploylog.jsx');
var Diff = require('./frontend/src/js/components/diff.jsx');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var Link = Router.Link;
//require('console-shim2'); // IE9 FIX

var Vera = React.createClass({

    getInitialState: function () {
        return {}
    },


    componentDidMount: function () {
        $.getJSON('/api/v1/config').done(function (data) {
            this.setState(data)
        }.bind(this));
    },

    render: function () {
        return (
            <div>
                <nav className="navbar navbar-fixed-top vera-header">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="#">
                                <span className="fa-stack fa-lg">
                                    <i className="fa fa-circle fa-stack-2x logo"></i>
                                    <strong className="fa-stack-1x fa-stack-text fa-comment-text ">V</strong>
                                </span>
                            &nbsp;vera</a>
                        </div>
                        <ul className="nav navbar-nav">
                            <li>
                                <Link to="log">
                                    <i className="fa fa-bars"></i>
                                &nbsp;log</Link>
                            </li>
                            <li>
                                <Link to="matrix">
                                    <i className="fa fa-table fa-sm active"></i>
                                &nbsp;matrix</Link>
                            </li>
                            <li>
                                <Link to="diff">
                                    <i className="fa fa-code-fork fa-sm active"></i>
                                    &nbsp;diff</Link>
                            </li>
                        </ul>
                    </div>
                </nav>
                <RouteHandler />
            </div>
        )
    }
})

var routes = (
    <Route handler={Vera}>
        <DefaultRoute handler={VersionMatrix} />
        <Route name="matrix" handler={VersionMatrix} />
        <Route name="log" handler={DeployLog}/>
        <Route name="diff" handler={Diff}/>
    </Route>
)

Router.run(routes, function (Handler) {
    React.render(<Handler />, document.getElementById('content'));
})

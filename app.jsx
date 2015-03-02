var React = require('react');
var VersionMatrix = require('./frontend/src/js/components/versionmatrix.jsx');
var DeployLog = require('./frontend/src/js/components/deploylog.jsx');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var Link = Router.Link;
require('console-shim'); // IE9 FIX

var Vera = React.createClass({
    render: function () {
        return (
            <div>
                <nav className="navbar navbar-static-top vera-header">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="#">
                                <span className="fa-stack fa-lg">
                                    <i className="fa fa-circle fa-stack-2x logo"></i>
                                    <strong className="fa-stack-1x fa-stack-text fa-comment-text ">V</strong>
                                </span>
                            vera</a>
                        </div>
                        <ul className="nav navbar-nav">
                            <li>
                                <Link to="matrix"><i className="fa fa-table fa-sm"></i>&nbsp;matrix</Link>
                            </li>
                            <li>
                                <Link to="log"><i className="fa fa-bars"></i>&nbsp;log</Link>
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
    </Route>
)

Router.run(routes, function (Handler) {
    React.render(<Handler />, document.getElementById('content'));
})

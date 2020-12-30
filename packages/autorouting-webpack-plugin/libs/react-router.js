var React = require('react')
var reactRouterDom = require('react-router-dom')

function RouteWithSubRoutes(route) {
  return React.createElement(reactRouterDom.Route, {
    path: route.path,
    render: function (props) {
      return React.createElement(route.component, Object.assign({}, props, { routes: route.routes }))
    }
  })
}

module.exports = function PacyRouter(props) {
  var routes = props.routes
  var Router = props.Router || reactRouterDom.HashRouter

  return React.createElement(
    Router,
    {},
    React.createElement(
      reactRouterDom.Switch,
      {},
      routes.map(function (route) {
        return React.createElement(RouteWithSubRoutes, Object.assign({ key: route.path, exact: true }, route))
      })
    )
  )
}

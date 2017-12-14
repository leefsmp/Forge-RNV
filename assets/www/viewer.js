/////////////////////////////////////////////////////////
// Initialize viewer environment
//
/////////////////////////////////////////////////////////
function initialize (options) {

  return new Promise(function(resolve, reject) {

    Autodesk.Viewing.Initializer (options,
      function () {

        resolve ()

      }, function(error){

        reject (error)
      })
  })
}

/////////////////////////////////////////////////////////
// load document from URN
//
/////////////////////////////////////////////////////////
function loadDocument (urn) {

  return new Promise(function(resolve, reject) {

    var paramUrn = !urn.startsWith("urn:")
      ? "urn:" + urn
      : urn

    Autodesk.Viewing.Document.load(paramUrn,
      function(doc) {

        resolve (doc)

      }, function (error) {

        reject (error)
      })
  })
}

/////////////////////////////////////////////////////////
// Get viewable items from document
//
/////////////////////////////////////////////////////////
function getViewableItems (doc, roles) {

  var rootItem = doc.getRootItem()

  var items = []

  var roleArray = roles
    ? (Array.isArray(roles) ? roles : [roles])
    : []

  roleArray.forEach(function(role) {

    var subItems =
      Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem, { type: "geometry", role: role }, true)

    items = items.concat(subItems)
  })

  return items
}

/////////////////////////////////////////////////////////
// get query parameter
//
/////////////////////////////////////////////////////////
function getQueryParam (name, url) {

  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/////////////////////////////////////////////////////////
// Initialize Environment
//
/////////////////////////////////////////////////////////
initialize({

  //acccessToken: getQueryParam("acccessToken"),
  env: "Local"

}).then(function() {

  // loadDocument ("urn:" + getQueryParam("urn")).then(function(doc) {

  //   var items = getViewableItems (doc, ["3d", "2d"])

  //   var path = doc.getViewablePath(items[0])

  //   var viewerDiv = document.getElementById("viewer")

  //   var viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv)

  //   viewer.start(path)
  // })

  var viewerDiv = document.getElementById("viewer")

  var viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv)
  
  viewer.start()

  viewer.loadModel('http://localhost:8080/www/models/office/Resource/3D_View/3D/office.svf')
})

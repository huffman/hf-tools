function getContentURLs() {
    var content = {
        props: [],
        avatars: [],
        sets: []
    };

    var req = new XMLHttpRequest();
    var BASE_S3_URL = "http://hifi-content.s3.amazonaws.com/";
    var PREFIX = "ozan/dev/gallery";
    req.open('GET', BASE_S3_URL + '?prefix=' + PREFIX, false);
    req.send();

    if (req.status != 200) {
        print("Failure to get list of resources: " + req.statusText);
    } else {
        var re = new RegExp('<Key>(ozan/dev/gallery/(avatars|props|sets)/[A-Za-z0-9_\/]+\.fbx)</Key>', 'g');
        var res = null;
        while (res = re.exec(req.responseText)) {
            var path = res[1];
            var type = res[2];
            print(type, path);
            content[type].push(BASE_S3_URL + path)
        }
    }

    return content;
}

var BASE_URL = "https://hifi-content.s3.amazonaws.com/ozan/dev/gallery";
var SCENE_NAME = "OZAN SET";
models = getContentURLs();

var entityIDs = Entities.findEntities({ x: 0, y: 0, z: 0 }, 500);
for (var i = 0; i < entityIDs.length; ++i) {
    var name = Entities.getEntityProperties(entityIDs[i], ['name']).name;
    print(name);
    if (name == SCENE_NAME) {
        Entities.deleteEntity(entityIDs[i]);
    }
}

function spawnModel(url, position) {
    var entityID = Entities.addEntity({
        type: "Model",
        name: SCENE_NAME,
        modelURL: url,
        position: position,
        dimensions: { x: 1, y: 1, z: 1 },
        rotation: Quat.fromPitchYawRollDegrees(0, 180, 0)
    });
    var numChecks = 0;
    var intervalID = Script.setInterval(function() {
        numChecks++;

        var properties = Entities.getEntityProperties(entityID, ['naturalDimensions']);
        var nd = properties.naturalDimensions;

        if (nd.x != 1 || nd.y != 1 || nd.z != 1 || numChecks > 80) {
            Script.clearInterval(intervalID);

            var maxDim = Math.max(nd.x, Math.max(nd.y, nd.z));
            var scaledDimensions = {
                x: nd.x / maxDim,
                y: nd.y / maxDim,
                z: nd.z / maxDim
            };
            Entities.editEntity(entityID, { dimensions: scaledDimensions });
        }
    }, 250);
}


function createGridOfModels(startPosition, offset, modelURLs) {
    var position = startPosition;
    for (var i = 0; i < modelURLs.length; ++i) {
        spawnModel(modelURLs[i], position);
        position = Vec3.sum(position, offset);
    }
}

const CENTER_RADIUS = 2;

createGridOfModels({ x: -CENTER_RADIUS, y: 0, z: 0 }, { x: -1.5, y: 0, z: 0 }, models.props);
createGridOfModels({ x: 0, y: 0, z: CENTER_RADIUS }, { x: 0, y: 0, z: 1.5 }, models.avatars);
createGridOfModels({ x: CENTER_RADIUS, y: 0, z: 0 }, { x: 1.5, y: 0, z: 0 }, models.sets);

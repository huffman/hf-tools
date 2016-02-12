var BASE_URL = "https://hifi-content.s3.amazonaws.com/ozan/dev/gallery";
var SCENE_NAME = "OZAN SET";
var models = {
    props: [
        BASE_URL + "/props/clouds/clouds.fbx",
        BASE_URL + "/props/gun_nailgun/gun_nailgun.fbx",
        BASE_URL + "/props/gun_shotgun/gun_shotgun.fbx",
        BASE_URL + "/props/tree_cypress/tree_cypress.fbx",
        BASE_URL + "/props/tree_pine/tree_pine.fbx",
    ],
    avatars: [
        BASE_URL + "/avatars/dougland/dougland.fbx",
        BASE_URL + "/avatars/huffman/huffman.fbx",
    ],
    sets: [
        BASE_URL + "/sets/dojo/dojo.fbx",
        BASE_URL + "/sets/tuscany/tuscany.fbx",
    ]
};

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

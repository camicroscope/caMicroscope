// validation rules for docments
var $VALIDATION_SCHEMAS = {}
$VALIDATION_SCHEMAS.slide = {
  type: "object",
  required: ["name", "location", "mpp"],
  properties: {
    name: {
      type: "string",
      description: "Slide display name"
    },
    study: {
      type: "string",
      description: "Slide study identifier"
    },
    specimen: {
      type: "string",
      description: "Slide specimen identifier"
    },
    location: {
      type: "string",
      description: "Slide location, used for opening"
    },
    mpp: {
      type: "number",
      minimum: 0,
      description: "Microns per pixel for scalebar"
    }
  }
}
$VALIDATION_SCHEMAS.mark = {
  type: "object",
  required: ["provenance"],
  properties: {
    marktype: {
      type: "object",
      required: ["image", "analysis"],
      properties: {
        image: {
          type: "object",
          required: ["slide", "study", "specimen"],
        },
        analysis: {
          type: "object",
          required: ["execution_id"],
        }
      }
    }
  }
};
$VALIDATION_SCHEMAS.heatmap = {
  type: "object",
  required: ["provenance"],
  properties: {
    marktype: {
      type: "object",
      required: ["image", "analysis"],
      properties: {
        image: {
          type: "object",
          required: ["slide", "study", "specimen"],
        },
        analysis: {
          type: "object",
          required: ["execution_id"],
        }
      }
    }
  }
};
$VALIDATION_SCHEMAS.template = {
  type: "object",
  required: ["id", "name", "properties"],
  properties: {
    id: {
      type: "string",
      description: "template identifier"
    },
    name: {
      type: "string",
      description: "template display name"
    },
    properties: {
      type: "object",
      description: "pure-form questions object",
      additionalProperties: {
        type: "object",
        required: ["title", "type"]
      }
    }
  }
};

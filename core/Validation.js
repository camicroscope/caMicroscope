// validation rules for docments.
// needs <script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/6.8.1/ajv.bundle.js"></script>
var ajv = new Ajv();
var $VALIDATION = {}
$VALIDATION.slide = ajv.compile({
  type: "object",
  required: ["name", "location", "study", "specimen"],
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
    }
  }
});
$VALIDATION.mark = ajv.compile({
  type: "object",
  required: ["provenance"],
  properties: {
    provenance: {
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
});
$VALIDATION.heatmap = ajv.compile({
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
});
$VALIDATION.template = ajv.compile({
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
});

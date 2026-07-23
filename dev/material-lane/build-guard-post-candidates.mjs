#!/usr/bin/env node
/**
 * Deterministically materialize the three frozen Guard Post candidate instances
 * derived from the hand-authored M01 frontier-broad-cool source.
 *
 * The emitted .ptex files remain the exact Material Maker compiler inputs. This
 * helper only prevents structural serialization drift between bounded instances.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const graphDir = path.join(here, "graphs", "guard-post");
const libraryDir = path.join(here, "library");
const baselinePath = path.join(graphDir, "gp-mm-m01-frontier-broad-cool-v001.ptex");

function clone(value) {
  return structuredClone(value);
}

function node(graph, name) {
  const found = graph.nodes.find((entry) => entry.name === name);
  if (!found) throw new Error(`Missing node ${name}`);
  return found;
}

function replaceConnectionNames(graph, from, to) {
  for (const connection of graph.connections) {
    if (connection.from === from) connection.from = to;
    if (connection.to === from) connection.to = to;
  }
}

function point(pos, r, g, b) {
  return { a: 1, b, g, pos, r };
}

function gradient(points) {
  return { interpolation: 1, points, type: "Gradient" };
}

function setM01Earth(graph) {
  graph.label = "GP-MM-M01 / Patrol Tempered Earth / v001";
  graph.name = "gp_mm_m01_patrol_tempered_earth_v001";
  const cells = node(graph, "gmm_n02c_coursed_cells_v001");
  Object.assign(cells.parameters, {
    param0: 6,
    param1: 9,
    param2: 0.18,
    param3: 0.047,
    param4: 0.048,
    param5: 0.02
  });
  node(cells, "gen_parameters").parameters = clone(cells.parameters);
  Object.assign(node(cells, "coursed_pattern").parameters, {
    rows: 6,
    iterations: 9,
    min_size: 0.18,
    mortar: 0.047,
    bevel: 0.048,
    round: 0.02
  });
  Object.assign(node(graph, "macro_field").parameters, { scale_x: 1.6, scale_y: 1.6 });
  Object.assign(node(graph, "surface_field").parameters, { scale_x: 9, scale_y: 9 });
  node(graph, "surface_height_range").parameters.gradient = gradient([
    point(0, 0.9, 0.9, 0.9),
    point(1, 0.995, 0.995, 0.995)
  ]);
  node(graph, "stone_palette").parameters.gradient = gradient([
    point(0, 0.39, 0.38, 0.35),
    point(0.5, 0.47, 0.45, 0.41),
    point(1, 0.55, 0.51, 0.45)
  ]);
  node(graph, "macro_palette").parameters.gradient = gradient([
    point(0, 0.41, 0.39, 0.35),
    point(1, 0.55, 0.51, 0.45)
  ]);
  node(graph, "mortar_color").parameters.color = {
    a: 1,
    b: 0.3,
    g: 0.31,
    r: 0.32,
    type: "Color"
  };
  node(graph, "stone_macro_blend").parameters.amount = 0.22;
  node(graph, "roughness_response").parameters.gradient = gradient([
    point(0, 0.89, 0.89, 0.89),
    point(1, 0.76, 0.76, 0.76)
  ]);
  node(graph, "normal_map").parameters.param1 = 0.62;
  node(graph, "candidate_configurations").parameters.param0 = 1;
  node(graph, "authoring_contract").text =
    "GP-MM-M01 / config patrol-tempered-earth / seed 180041 / 512 target. Base operational construction only: no moss, grime, leaks, cracks, abandonment, wetness, or damage state.";
}

function makeRubbleCellGraph(seed) {
  return {
    connections: [
      { from: "fitted_pattern", from_port: 0, to: "gen_outputs", to_port: 0 },
      { from: "fitted_pattern", from_port: 1, to: "per_unit_value", to_port: 0 },
      { from: "per_unit_value", from_port: 0, to: "gen_outputs", to_port: 1 }
    ],
    label: "GMM-N02R Fitted Rubble Construction Cells v001",
    longdesc:
      "Genesis versioned construction-cell node. Offsets a bounded rectilinear interlock in both axes for local fitted rubble without Voronoi fragmentation, then emits per-unit variation. Immutable once published.",
    name: "gmm_n02r_fitted_rubble_cells_v001",
    node_position: { x: -760, y: -100 },
    nodes: [
      {
        name: "fitted_pattern",
        node_position: { x: -430, y: -70 },
        parameters: {
          bevel: 0.035,
          corner: 0.12,
          mortar: 0.055,
          randomness: 0.26,
          round: 0.018,
          x: 4,
          y: 4
        },
        seed,
        seed_locked: true,
        type: "bricks_uneven4"
      },
      {
        name: "per_unit_value",
        node_position: { x: -145, y: 30 },
        parameters: { edgecolor: 1 },
        seed: 420218,
        seed_locked: true,
        type: "fill_to_random_grey2"
      },
      {
        name: "gen_parameters",
        node_position: { x: -430, y: -290 },
        parameters: {
          param0: 4,
          param1: 4,
          param2: 0.26,
          param3: 0.055,
          param4: 0.035,
          param5: 0.018,
          param6: 0.12
        },
        type: "remote",
        widgets: [
          {
            label: "Horizontal cells",
            linked_widgets: [{ node: "fitted_pattern", widget: "x" }],
            name: "param0",
            type: "linked_control"
          },
          {
            label: "Vertical cells",
            linked_widgets: [{ node: "fitted_pattern", widget: "y" }],
            name: "param1",
            type: "linked_control"
          },
          {
            label: "Fitting irregularity",
            linked_widgets: [{ node: "fitted_pattern", widget: "randomness" }],
            name: "param2",
            type: "linked_control"
          },
          {
            label: "Joint width",
            linked_widgets: [{ node: "fitted_pattern", widget: "mortar" }],
            name: "param3",
            type: "linked_control"
          },
          {
            label: "Edge bevel",
            linked_widgets: [{ node: "fitted_pattern", widget: "bevel" }],
            name: "param4",
            type: "linked_control"
          },
          {
            label: "Corner round",
            linked_widgets: [{ node: "fitted_pattern", widget: "round" }],
            name: "param5",
            type: "linked_control"
          },
          {
            label: "Corner region",
            linked_widgets: [{ node: "fitted_pattern", widget: "corner" }],
            name: "param6",
            type: "linked_control"
          }
        ]
      },
      {
        name: "gen_inputs",
        node_position: { x: -700, y: -80 },
        parameters: {},
        ports: [],
        type: "ios"
      },
      {
        name: "gen_outputs",
        node_position: { x: 115, y: -70 },
        parameters: {},
        ports: [
          { name: "height", type: "f" },
          { name: "unit_value", type: "f" }
        ],
        type: "ios"
      }
    ],
    parameters: {
      param0: 4,
      param1: 4,
      param2: 0.26,
      param3: 0.055,
      param4: 0.035,
      param5: 0.018,
      param6: 0.12
    },
    seed,
    seed_locked: true,
    shortdesc: "Bounded local fitted-rubble cells with per-unit variation.",
    type: "graph"
  };
}

function makeM02ConfigControl(selected) {
  const linked = [];
  for (let index = 0; index < 7; index += 1) {
    linked.push({ node: "gmm_n02r_fitted_rubble_cells_v001", widget: `param${index}` });
  }
  linked.push(
    { node: "macro_field", widget: "scale_x" },
    { node: "macro_field", widget: "scale_y" },
    { node: "normal_map", widget: "param1" }
  );
  const values = (shape, macroScale, normalStrength) => [
    ...shape.map((value, index) => ({
      node: "gmm_n02r_fitted_rubble_cells_v001",
      value,
      widget: `param${index}`
    })),
    { node: "macro_field", value: macroScale, widget: "scale_x" },
    { node: "macro_field", value: macroScale, widget: "scale_y" },
    { node: "normal_map", value: normalStrength, widget: "param1" }
  ];
  return {
    name: "candidate_configurations",
    node_position: { x: 520, y: -360 },
    parameters: { param0: selected },
    type: "remote",
    widgets: [
      {
        configurations: {
          "upland-close-set": values([6, 6, 0.38, 0.045, 0.044, 0.022, 0.14], 1.65, 0.64),
          "upland-heavy-fitted": values([4, 4, 0.26, 0.055, 0.035, 0.018, 0.12], 1.35, 0.58)
        },
        label: "Bounded candidate",
        linked_widgets: linked,
        name: "param0",
        type: "config_control"
      }
    ]
  };
}

function makeM02(graph, config) {
  const isClose = config === "upland-close-set";
  const seed = 180042;
  graph.seed = seed;
  graph.name = isClose
    ? "gp_mm_m02_upland_close_set_v001"
    : "gp_mm_m02_upland_heavy_fitted_v001";
  graph.label = isClose
    ? "GP-MM-M02 / Upland Close Set / v001"
    : "GP-MM-M02 / Upland Heavy Fitted / v001";

  const oldName = "gmm_n02c_coursed_cells_v001";
  const oldIndex = graph.nodes.findIndex((entry) => entry.name === oldName);
  if (oldIndex < 0) throw new Error("Missing M01 cell graph");
  graph.nodes[oldIndex] = makeRubbleCellGraph(seed);
  replaceConnectionNames(graph, oldName, "gmm_n02r_fitted_rubble_cells_v001");

  const shape = isClose
    ? { param0: 6, param1: 6, param2: 0.38, param3: 0.045, param4: 0.044, param5: 0.022, param6: 0.14 }
    : { param0: 4, param1: 4, param2: 0.26, param3: 0.055, param4: 0.035, param5: 0.018, param6: 0.12 };
  const cells = node(graph, "gmm_n02r_fitted_rubble_cells_v001");
  Object.assign(cells.parameters, shape);
  node(cells, "gen_parameters").parameters = clone(cells.parameters);
  Object.assign(node(cells, "fitted_pattern").parameters, {
    x: shape.param0,
    y: shape.param1,
    randomness: shape.param2,
    mortar: shape.param3,
    bevel: shape.param4,
    round: shape.param5,
    corner: shape.param6
  });

  node(graph, "macro_field").seed = 402180;
  Object.assign(node(graph, "macro_field").parameters, {
    scale_x: isClose ? 1.65 : 1.35,
    scale_y: isClose ? 1.65 : 1.35
  });
  node(graph, "surface_field").seed = 412180;
  Object.assign(node(graph, "surface_field").parameters, {
    scale_x: isClose ? 8.5 : 6.5,
    scale_y: isClose ? 8.5 : 6.5
  });
  node(graph, "surface_height_range").parameters.gradient = isClose
    ? gradient([point(0, 0.91, 0.91, 0.91), point(1, 0.995, 0.995, 0.995)])
    : gradient([point(0, 0.89, 0.89, 0.89), point(1, 0.995, 0.995, 0.995)]);
  node(graph, "stone_palette").parameters.gradient = isClose
    ? gradient([
        point(0, 0.4, 0.37, 0.33),
        point(0.5, 0.49, 0.45, 0.39),
        point(1, 0.56, 0.52, 0.46)
      ])
    : gradient([
        point(0, 0.39, 0.4, 0.38),
        point(0.5, 0.47, 0.46, 0.42),
        point(1, 0.53, 0.5, 0.44)
      ]);
  node(graph, "macro_palette").parameters.gradient = isClose
    ? gradient([point(0, 0.4, 0.37, 0.33), point(1, 0.57, 0.53, 0.47)])
    : gradient([point(0, 0.39, 0.4, 0.38), point(1, 0.54, 0.51, 0.45)]);
  node(graph, "mortar_color").parameters.color = {
    a: 1,
    b: isClose ? 0.28 : 0.3,
    g: isClose ? 0.29 : 0.31,
    r: isClose ? 0.31 : 0.31,
    type: "Color"
  };
  node(graph, "stone_macro_blend").parameters.amount = isClose ? 0.23 : 0.2;
  node(graph, "roughness_response").parameters.gradient = gradient([
    point(0, isClose ? 0.89 : 0.92, isClose ? 0.89 : 0.92, isClose ? 0.89 : 0.92),
    point(1, isClose ? 0.75 : 0.78, isClose ? 0.75 : 0.78, isClose ? 0.75 : 0.78)
  ]);
  node(graph, "normal_map").parameters.param1 = isClose ? 0.64 : 0.58;
  node(graph, "candidate_configurations").parameters.param0 = isClose ? 0 : 1;
  const configIndex = graph.nodes.findIndex((entry) => entry.name === "candidate_configurations");
  graph.nodes[configIndex] = makeM02ConfigControl(isClose ? 0 : 1);
  node(graph, "authoring_contract").text =
    `GP-MM-M02 / config ${config} / seed 180042 / 512 target. Base operational construction only: no moss, grime, leaks, cracks, abandonment, wetness, or damage state.`;
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

const m01Earth = clone(baseline);
setM01Earth(m01Earth);
writeJson(path.join(graphDir, "gp-mm-m01-patrol-tempered-earth-v001.ptex"), m01Earth);

const m02Heavy = clone(baseline);
makeM02(m02Heavy, "upland-heavy-fitted");
writeJson(path.join(graphDir, "gp-mm-m02-upland-heavy-fitted-v001.ptex"), m02Heavy);

const m02Close = clone(baseline);
makeM02(m02Close, "upland-close-set");
writeJson(path.join(graphDir, "gp-mm-m02-upland-close-set-v001.ptex"), m02Close);

const library = {
  name: "Genesis Guard Post MM1.3 v001",
  lib: [
    {
      ...clone(node(baseline, "gmm_n02c_coursed_cells_v001")),
      name: "gmm_n02c_coursed_cells_v001",
      node_position: { x: 0, y: 0 },
      tree_item: "Genesis/Construction/GMM-N02C Coursed Construction Cells v001"
    },
    {
      ...makeRubbleCellGraph(180042),
      name: "gmm_n02r_fitted_rubble_cells_v001",
      node_position: { x: 0, y: 0 },
      tree_item: "Genesis/Construction/GMM-N02R Fitted Rubble Construction Cells v001"
    }
  ]
};
writeJson(path.join(libraryDir, "genesis-guard-post-mm13-v001.json"), library);

console.log("Materialized 3 frozen candidates and Genesis custom-node library v001.");

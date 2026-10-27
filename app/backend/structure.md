Path 	What’s there
src/app.rs 	Wires routes, workers, and tasks together — the one file that ties everything to Hooks.
src/controllers/ 	Request handlers, one file per resource.
src/models/ 	Your database entities (_entities/, generated) and your own model logic.
migration/src/ 	One file per schema change, applied in order.
config/development.yaml 	Settings for the development environment — port, database URI, logging, etc.
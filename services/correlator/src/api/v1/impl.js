const path = require('path');
const goal = require('./models/goal.js');

// controllers
const contacts = require('./ctrls/contacts.js');
const goals = require('./ctrls/goals.js');
const flows = require('./ctrls/flows.js');
const docs = require('./ctrls/docs.js');

module.exports = function(express, jsv, reply, helpers) {

  this.routerPath = '/api/v1';
  this.router = express.Router();
  //----------------------------------------------------------------------------
  // projects specific declarations

  this.goalsRouter = express.Router();
  this.docsRouter = express.Router();
  //
  // compile schemas
  jsv.compile(goal.GoalParamSchemaId, goal.GoalParamSchema);

  // Execution context
  const home = __dirname;
  this.context = {
    jsv: jsv,
    contacts: new contacts.Contacts(home),
    goals: new goals.Goals(home),
    flows: new flows.Flows(home),
    docs: new docs.Docs(home)
   };

  //----------------------------------------------------------------------------
  // api enpoint info
  this.router.route('/')
    // version info
    .get(function (req, res) {
      return res.json(reply.success({id:'v1'}));
    });
  //----------------------------------------------------------------------------
  // projects specific functionality
  // goals
  this.goalsRouter.route('/*')
    // get all goals
    //.get(function (req, res) {
    //  return res.json(reply.success(req.params[0]));
    //})
    // create new goal
    .post(helpers.validateReqBody(jsv, goal.GoalParamSchemaId), function (req, res) {
      const data = req.body;
      this.context.flows.createFlowById(data.flowId)
        .then( flow => {
          const goal = this.context.goals.createGoal(data);
          return goal.execute(flow, context)
            .then(r => res.json(reply.success(r)))
            .catch(e => res.status(400).json(reply.fail(e)));
          })
        .catch(e => res.status(400).json(reply.fail(e)));
    });
  // docs
  this.docsRouter.route('/*')
    // get doc
    .get(function (req, res) {
      const id = req.params[0];
      this.context.docs.getDocById(id)
        .then( doc => res.json(reply.success(doc.json())))
        .catch(e => res.status(400).json(reply.fail(`Invalid request parameter: '${id}'`)));
    });

  //this.router.use('/contacts', );
  this.router.use('/goals', goalsRouter);
  //this.router.use('/flows', );
  this.router.use('/docs', docsRouter);
  //----------------------------------------------------------------------------
  //
  this.getRouterPath = function() {
    return this.routerPath;
  }
  this.getRouter = function() {
    return this.router;
  }
  return this;
}


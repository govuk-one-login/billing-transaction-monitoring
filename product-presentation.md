# Product Presentation

## Outline

- Establish the PD team’s problem with invoices
- Outline our solution from a data perspective
- What is Grafana?
- What was good about Grafana from a rapid prototyping perspective?
- What was bad about Grafana from a product maturity perspective?
- How did we map out an iterative approach to Version 2?
- How did we adapt the existing product to dovetail with V2?
- What is novel about our new solution?
- What challenges have we faced?
- Forward look to V2.1
- Final compare/contrast summary of Grafana vs V2

## The Invoice Issue

One Login is quite expensive. With millions of identities to verify a lot of money is spent, and will be spent, on verification services from third party providers. The program needs to be sure that it's getting what it's paying for. And it's not just identity verification, there's managed services, technical resources like AWS, fixed running costs, the list goes on.

## How can we help?

The headline is data. Our original architecture, produced in late 2022, was a pair of data processing pipelines - one ingesting invoices, the other ingesting events originating inside DI. We take the unstructured data of an invoice and harness the power of AI to obtain structured insights. Meanwhile corresponding events are gathered in real time.

As soon as a user snaps a photo of their passport, or walks into a Post Office and hands over their drivers license we get notified and that event is captured in our data lake. We check these events tally with the invoices we receive and either provide assurance that we've been billed correctly or provide evidence to query unrecognized charges.

The final piece of this puzzle is some kind of user interface, after all the data is useless if no one is empowered to act on it. Luckily the program already had an out of the box solution to displaying data insights in the form of Grafana.

## What is Grafana?

Those of you managing tech teams may already be familiar, your team probably has its own Grafana dashboard providing application monitoring. This is the primary use case of Grafana. Principally Grafana lets you connect a data source, query it and display the results as a table, chart or graph. It's designed to be flexible and friendly, allowing teams to chop and change the data on display as they learn which of their application metrics are worth monitoring.

Grafana gave us a lightweight way to provide insights to our users without worrying about the usual hurdles that teams face when they develop their own front ends from scratch. It was exactly what we needed to be able to rapidly deliver a minimum viable product.

## Grafana: The Good the Bad and the Ugly?

We faced some issues in the early days with granting permission to Grafana to access our data source, but once we got it working we were flying. Grafana is designed to be straight forward, all we had to do was write some rudimentary SQL and almost immediately we could visualize our data. It also provided an out of the box roles based access control system that we could use to provide varying levels of access to users and developers.

We had to do some awkward wangles to meet our user requirements we needed to introduce strange pieces of code, we called them Magic Numbers, that Grafana could interpret to change the UI state depending on the state of the invoice reconciliation.

Another issue we had was deployment. The rest of our application is seamlessly deployed by Infrastructure as Code but we couldn't do this with Grafana. This made it a vestigial entity whose source code and version control we had to manage manually.

The final issue was that Grafana didn't give us any way to offer user interactivity. At the vary least we wanted to give the PD team a way to tell us that they'd paid off an invoice so we could deprioritize it, but even a simple button like this was out of our reach. To achieve our long term goal of developerless supplier onboarding we would need a more flexible solution

## Steps to a More Flexible Solution

The first step we took was getting buy in from our architects. An important consideration here is that using tried and tested resources is generally more readily accepted when you want to move quickly. If you've got a lot of houses to build you're better off proposing that they be made of bricks than osmium. Therefore we opted to host our front end not with servers, which would have introduced a new component to our stack, but with Lambda Functions, which we were already using extensively. After some refinement with the team and a quick PoC we pitched our idea to our pod's architects. The infrastructure went through a few iterations and debates were had about who our authentication provider would be, but eventually a workable solution emerged.

Once we figured out how we'd build our platform the next step was working out what we wanted to put there. We produced a Spartan but functional initial design which replicated all the necessary functionality of Grafana, this acted as the basis of our MVP. We validated this with our stakeholders then, as a team, divided it and the infrastructure into workable chunks.

We broke ground on June 19th, productionising our PoC with a keen eye on developer experience. To deliver quickly it's paramount that your team can work quickly. To this ends we employed a novel use of some well recognized web hosting technologies, providing both lightning fast hot reloads in development environments and seamless deployments in higher environments.

## What Adaptations Did We Make to the Existing System?

None. Because Grafana was purely for display purposes, and it was capable of reading from our data source itself, we didn't need to make any changes to our data pipelines. This in turn means there's been very little waste as Grafana will be the only redundant component at the end of this process.

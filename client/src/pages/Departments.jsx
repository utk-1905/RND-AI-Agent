const departments = [
  {
    name: "SEO Department",
    agent: "SEO AI Agent",
    status: "active",
    description:
      "Handles SEO audit, keywords, on-page SEO, technical SEO, AEO, GEO, LLM optimization, blog/content generation, and SEO reports.",
  },
  {
    name: "Business/Sales Team",
    agent: "Sales AI Agent",
    status: "planned",
    description:
      "Will handle lead generation, cold emails, LinkedIn messages, WhatsApp outreach, proposals, and follow-up plans.",
  },
  {
    name: "HR Department",
    agent: "HR AI Agent",
    status: "planned",
    description:
      "Will handle vacancies, hiring support, onboarding material, interview questions, and work environment support.",
  },
  {
    name: "DevOps",
    agent: "DevOps AI Agent",
    status: "planned",
    description:
      "Will handle server maintenance guidance, deployment support, project upload workflows, and GitHub operations.",
  },
  {
    name: "Website Development",
    agent: "Website Development AI Agent",
    status: "planned",
    description:
      "Will handle frontend/backend website planning using MERN Stack, Laravel, WordPress, and Shopify.",
  },
  {
    name: "Software Development",
    agent: "Software Development AI Agent",
    status: "planned",
    description:
      "Will handle software requirement analysis, module planning, MERN Stack workflows, and Laravel workflows.",
  },
  {
    name: "Mobile App Development",
    agent: "Mobile App AI Agent",
    status: "planned",
    description:
      "Will handle mobile app planning using Flutter, CodeIgniter/code in, and Java as provided in the company structure.",
  },
  {
    name: "Branding Department",
    agent: "Branding AI Agent",
    status: "planned",
    description:
      "Will handle branding work from pen design to logo, visiting cards, catalog, brochure, and company design using Photoshop, Illustrator, and CorelDRAW.",
  },
  {
    name: "Social Media Team",
    agent: "Social Media AI Agent",
    status: "planned",
    description:
      "Will handle Instagram, Facebook, and LinkedIn posts, reels, stories, and marketing content planning.",
  },
  {
    name: "Podcast Team",
    agent: "Podcast AI Agent",
    status: "planned",
    description:
      "Will support companies that want podcast services for promotion and brand communication.",
  },
];

const statusClass = {
  active: "bg-green-100 text-green-700",
  planned: "bg-slate-100 text-slate-700",
};

const Departments = () => {
  const activeDepartments = departments.filter(
    (department) => department.status === "active"
  ).length;

  const plannedDepartments = departments.filter(
    (department) => department.status === "planned"
  ).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Departments</h2>
        <p className="text-slate-500 mt-1">
          View all virtual department agents and track which modules are active or planned.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Departments" value={departments.length} />
        <StatCard label="Active Agents" value={activeDepartments} />
        <StatCard label="Planned Agents" value={plannedDepartments} />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map((department) => (
          <div
            key={department.name}
            className="bg-white border rounded-2xl shadow-sm p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{department.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {department.agent}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  statusClass[department.status]
                }`}
              >
                {department.status}
              </span>
            </div>

            <p className="text-sm text-slate-600 mt-4 leading-6">
              {department.description}
            </p>

            {department.status === "active" ? (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                This department agent is currently working in mock mode.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-600">
                This department agent will be added after the current active module is stable.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
};

export default Departments;
import { lazy } from "react";

// Lazy loading para componentes del Dashboard
export const Dashboard = lazy(() =>
  import("./components/Dashboard").then((module) => ({
    default: module.Dashboard,
  }))
);

export const LinkedInOptimizer = lazy(() =>
  import("./components/LinkedInOptimizer").then((module) => ({
    default: module.LinkedInOptimizer,
  }))
);

export const CVBoost = lazy(() =>
  import("./components/CVBoost").then((module) => ({ default: module.CVBoost }))
);

export const JobTracker = lazy(() =>
  import("./components/JobTracker").then((module) => ({
    default: module.JobTracker,
  }))
);

export const ELearningHub = lazy(() =>
  import("./components/ELearningHub").then((module) => ({
    default: module.ELearningHub,
  }))
);

export const MockInterviews = lazy(() =>
  import("./components/MockInterviews").then((module) => ({
    default: module.MockInterviews,
  }))
);

export const AdditionalServices = lazy(() =>
  import("./components/AdditionalServices").then((module) => ({
    default: module.AdditionalServices,
  }))
);

export const GeneralSettings = lazy(() =>
  import("./components/GeneralSettings").then((module) => ({
    default: module.GeneralSettings,
  }))
);

export const PaymentSettings = lazy(() =>
  import("./components/PaymentSettings").then((module) => ({
    default: module.PaymentSettings,
  }))
);

// Lazy loading para páginas principales
export const LandingPage = lazy(() =>
  import("./components/LandingPage").then((module) => ({
    default: module.LandingPage,
  }))
);

export const LoginPage = lazy(() =>
  import("./components/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);

export const PaymentPage = lazy(() =>
  import("./components/PaymentPage").then((module) => ({
    default: module.PaymentPage,
  }))
);

export const NotFound = lazy(() =>
  import("./pages/NotFound")
);

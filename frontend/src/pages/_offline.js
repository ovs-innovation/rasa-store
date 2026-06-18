import React from "react";
import Layout from "@layout/Layout";

const Offline = () => {
  return (
    <Layout title="Rasa Store">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-6 sm:py-10">
        <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-bold">You’re offline.</span>{" "}
          Some content may be unavailable until your connection is back.
        </div>

        {/* Keep UI consistent: show home-like skeletons instead of a separate offline screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="h-7 w-2/3 bg-slate-100 rounded mb-4" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-5/6 bg-slate-100 rounded mb-6" />
              <div className="h-11 w-full bg-slate-100 rounded-lg" />
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="h-5 w-1/2 bg-slate-100 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-12 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Offline;

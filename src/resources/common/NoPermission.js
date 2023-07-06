import React from "react";

//3rd party packages
import Skeleton from "react-loading-skeleton";
import { Helmet } from "react-helmet";

//functions
import { _t } from "../../functions/Functions";
import { useTranslation } from "react-i18next";
const NoPermission = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{_t(t("Checking access"))}</title>
      </Helmet>
      <main id="main" data-simplebar>
        <div className="fk-scroll--index t-mt-15 t-mb-15" data-simplebar>
          <div className="container">
            <div className="row gx-3">
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
              <div className="col-md-6 col-lg-4 t-mb-30">
                <Skeleton style={{ height: "250px" }} className="bg-white" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default NoPermission;

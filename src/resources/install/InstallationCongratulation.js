import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

//functions
import { _t } from "../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import "react-toastify/dist/ReactToastify.css";

const InstallationCongratulation = () => {
  const { t } = useTranslation();

  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{_t(t("Congratulations"))}</title>
      </Helmet>

      {/* main body */}
      <div id="main" className="main-height-100" data-simplebar>
        <div className="container">
          <div className="row t-mt-10 gx-2">
            {/* Rightbar contents */}
            <div className="col-10 offset-1 t-mb-30 mb-lg-0">
              <div className="t-bg-white">
                <div className="installation-full-page" data-simplebar>
                  <div className="t-pl-15 t-pr-15 congratulation-page">
                    {/* Loading effect */}
                    <div key="smtp-form" className="congratulation-page-margin">
                      <div className="row gx-2 align-items-center t-pt-15 t-pb-15">
                        <div className="col-md-6 col-lg-5 t-mb-15 mb-md-0">
                          <ul className="t-list fk-breadcrumb">
                            <li className="fk-breadcrumb__list"></li>
                          </ul>
                        </div>
                        <div className="col-md-6 col-lg-7">
                          <div className="row gx-3 align-items-center"></div>
                        </div>
                      </div>

                      {/* Form starts here */}
                      <div className="text-center">
                        <h3 className="text-success font-weight-bold text-uppercase text-decoration-underline">
                          Congratulations!
                        </h3>
                      </div>

                      <div className="text-center pt-3">
                        <p className="pt-3">
                          You have successfully completed the installation
                          process
                        </p>
                        <p className="text-uppercase">
                          <a
                            href="https://codecanyon.net/item/khadyo-restaurant-software/29878013"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Do not forget to give us a positive rating by
                            clicking here
                          </a>
                        </p>
                        <div className="text-center">
                          <a
                            href="/"
                            className="btn btn-primary px-4 mt-2 mb-3 text-uppercase"
                          >
                            Start using
                          </a>
                        </div>
                      </div>

                      {/* Form ends here */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Rightbar contents end*/}
          </div>
        </div>
      </div>
      {/* main body ends */}
    </>
  );
};

export default InstallationCongratulation;

import React from 'react';

const Blocked = () => {
    return (
        <>
            <div className="fk-global-access">
                <div className="d-none d-lg-block">
                    <div className="fk-global-img text-center">
                        <img
                            src="/assets/img/sign-in.png"
                            alt="khadyo"
                            className="img-fluid mx-auto fk-global-img__is"
                        />
                        <img
                            src="/assets/img/obj-1.png"
                            alt="khadyo"
                            className="img-fluid fk-global-img__obj fk-global-img__obj-1"
                        />
                        <img
                            src="/assets/img/obj-8.png"
                            alt="khadyo"
                            className="img-fluid fk-global-img__obj fk-global-img__obj-2"
                        />
                        <img
                            src="/assets/img/obj-7.png"
                            alt="khadyo"
                            className="img-fluid fk-global-img__obj fk-global-img__obj-6"
                        />
                        <img
                            src="/assets/img/obj-9.png"
                            alt="khadyo"
                            className="img-fluid fk-global-img__obj fk-global-img__obj-8"
                        />
                    </div>
                </div>
                <div class="container my-md-auto">
                    <div class="row">
                        <div class="col-md-8 col-lg-6 col-xl-4 t-mt-50 text-center">
                            <div class="fk-global-form">
                                <div>
                                    <h5 class="font-weight-normal">Your subscription has been deactivated. Please activate your account from
                                        <a class="text-danger" target='_blank' href="https://automatefood.com"> automatefood.com</a></h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Blocked;

import React from 'react';

const Expired = () => {
    return (
        <>
            <div className="fk-global-access">
                <div class="container my-md-auto">
                    <div class="row justify-content-center align-items-center">
                        <div class="col-12 col-md-8 col-lg-6">
                            <div class="fk-global-form">
                                <div className='text-center'>
                                    <h3 class="font-weight-normal">Sorry,You have exceeded your maximum quota</h3>
                                    <p class="lead font-weight-normal text-capitalize">To add more product please upgrade your saas package</p>
                                    <a class="btn btn-outline-danger" target='_blank' href="https://thetestserver.xyz/">Upgrade now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Expired;

import React, { useEffect, useState } from 'react';
import axios from "axios";


const SaasContext = React.createContext();
const saas_key = '$2a$12$pkLmD5jZdxd6bSNcTg9YT.g2mXz5gS8JTArdIg68c8RK/d7w2y2Gu';
const apiUrl = 'https://test.thetestserver.xyz';
const apiParams = `saas_key=${saas_key}&domain=prince.thetestserver.xyz`;// replace with base url (prince.thetestserver.xyz)

const saas_form_data = {
    'saas_key': saas_key,
    'domain': 'prince.thetestserver.xyz'
};
// check expiry on SaasApp component
// user subscription on SaasApp component

const handleSass3 = () => {
    // create food items limit
    const url = apiUrl + '/api/user-items-limit?' + apiParams;// replace with base url (prince.thetestserver.xyz)
    axios.get(url).then((res) => {
        console.log(res);
    }).catch(() => {
        return 'NO data'
    });
}



const handleSass6 = () => {
    // check subscription end 
    const url = apiUrl + '/api/user-subscription-date-endin?' + apiParams;// replace with base url (prince.thetestserver.xyz)
    axios.get(url).then((res) => {
        console.log(res);
    }).catch(() => {
        return 'NO data'
    });;
}
// const handleSass7 = () => {
//     // after send api req decremeny by one
//     const url = apiUrl + '/api/user-item-limit-decrement';// replace with base url (prince.thetestserver.xyz)
//     axios.post(url, saas_form_data).then((res) => {
//         console.log(res);
//     }).catch(() => {
//         return 'NO data'
//     });;
// }


// for branch
// /user-branch-limit-left //get check limit
// /user-branch-limit / to show branch limit on profile

// done
// /user-restriction //get check is user ban
// /user-branch-limit-check / check limit or expired
// /user-branch-limit-decrement //post on add branch send api

const SaasProvider = ({ children }) => {
    const [expiry, setExpiry] = useState(false);

    const handleSass = () => {
        // check expiry if no then can not access  else continue
        const url = apiUrl + '/api/check-expiry';
        axios.post(url, saas_form_data).then((res) => {
            if (res.data == 'YES') {
                setExpiry(true);
            }
            else {
                setExpiry(false);
            }

        }).catch(() => {
            return 'No Data Found'
        });
    }


    useEffect(() => {
        handleSass();
    }, []);
    return (
        <SaasContext.Provider value={
            expiry,
            setExpiry
        }>
            {children}
        </SaasContext.Provider>
    );
}

export { SaasContext, SaasProvider };

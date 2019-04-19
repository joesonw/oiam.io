import * as React from 'react';

import AccountPage from 'pages/Account';
import GroupPage from 'pages/Group';
import GroupBindingPage from 'pages/GroupBinding';
import PolicyPage from 'pages/Policy';
import PolicyBindingPage from 'pages/PolicyBinding';
import RolePage from 'pages/Role';
import SecretPage from 'pages/Secret';
import NamespacePage from 'pages/Namespace';
import AssumeRolePage from 'pages/AssumeRole';

const routes = [{
    path: '/iam/account',
    body: () => <AccountPage />,
}, {
    path: '/iam/role',
    body: () => <RolePage />,
}, {
    path: '/iam/group',
    body: () => <GroupPage />,
}, {
    path: '/iam/policy',
    body: () => <PolicyPage />,
}, {
    path: '/iam/groupbinding',
    body: () => <GroupBindingPage />,
}, {
    path: '/iam/policybinding',
    body: () => <PolicyBindingPage />,
}, {
    path: '/iam/secret',
    body: () => <SecretPage />,
}, {
    path: '/iam/namespace',
    body: () => <NamespacePage />,
}, {
    path: '/sts/assume',
    body: () => <AssumeRolePage />,
}];

export default routes;

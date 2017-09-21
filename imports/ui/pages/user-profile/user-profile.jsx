import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Roles } from 'meteor/alanning:roles';

import { updateUserInfo } from '/imports/api/users/users.js';

import React from 'react';
import { Creatable as Select } from 'react-select';
import '/node_modules/react-select/dist/react-select.css';
import update from 'immutability-helper';
import pick from 'lodash/pick';
import isEqual from 'lodash/isequal';
import { diff } from 'rus-diff';

import './user-profile.scss';


const UserProfileButtons = (props) => {
  const buttons = isEqual(props.oldState, props.newState) ?
  (
    <div className="user-profile-buttons">
      <button type="button" className="btn btn-warning" onClick={props.resetPassword}>
        Reset password
      </button>
      <button type="button" className="btn btn-danger" onClick={props.deleteAccount}>
        Delete account
      </button>
    </div>
  ) :
  (
    <div className='user-profile-buttons'>
      <button type="button" className="btn btn-success" onClick={props.saveChanges}>
        Save changes
      </button>
      <button type="button" className="btn btn-danger" onClick={props.cancelChanges}>
        Cancel
      </button>
    </div>
  )
  return buttons
}

const UserRoles = (props) => {
  return (
    <div className="form-group">
      <label htmlFor="groups" className="col-sm-4 control-label">User roles</label>
      <Select
        name='user-role-select'
        className='col-sm-8'
        value={props.userRoles}
        options={props.allRoles.map(role => { return {value: role, label: role} })}
        onChange={props.onChange}
        multi={true}
        disabled={!props.isAdmin}
      />
    </div>
  )
}

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructing user profile component')
    this.state = this.props.user
  }

  componentWillReceiveProps(nextProps){
    this.setState(nextProps.user)
  }

  resetPassword = (event) => {
    event.preventDefault();
    alert('This currently does nothing')
    console.log('resetPassword');
  }

  deleteAccount = (event) => {
    event.preventDefault();
    alert('This currently does nothing')
    console.log('deleteAccount')
  }

  saveChanges = (event) => {
    event.preventDefault();
    const update = diff(this.props.user,this.state);
    console.log(update);
    console.log(this.props)
    updateUserInfo.call({
      userId: this.props.user._id,
      update: update
    })
  }

  cancelChanges = (event) => {
    event.preventDefault();
    this.setState(this.props.user);
  }
  
  handleChange = (event) => {
    const key = event.target.id;
    const value = event.target.value;
    const name = event.target.name;

    switch (key){
      case 'username':
        this.setState({username: value})
        break
      case 'email':
        const index = parseInt(name[name.length - 1]);
        const emails = this.state.emails.slice(); //empty slice to copy email array and not modify state
        emails[index] = value;
        this.setState({emails: emails})
        break
      case 'firstname':
        this.setState({
          profile: update(this.state.profile, {
            first_name: {
              $set: value
            }
          })
        })
        break
      case 'lastname':
        this.setState({
          profile: update(this.state.profile, {
            last_name: {
              $set: value
            }
          })
        })
        break
    }
  }

  updateRoles = (newRoles) => {
    const newState = update(this.state, {
      roles: {
        $set: newRoles.map( role => role.value)
      }
    })
    this.setState(newState)
  }

  render(){
    return (
      this.props.loading ?
      <div className='user-profile'>LOADING</div> :

      <div className="user-profile">
        <h3> User profile </h3>
        <form className="form-horizontal user-profile well well-sm">
          <div className="form-group">
            <label htmlFor="username" className="col-sm-4 control-label">Username</label>
            <div className="col-sm-8">
              <input 
                type="text" 
                className="form-control" 
                id="username"
                onChange={this.handleChange} 
                value={this.state.username}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="firstname" className="col-sm-4 control-label">First name</label>
            <div className="col-sm-8">
              <input 
                type="text" 
                className="form-control" 
                id="firstname" 
                onChange={this.handleChange}
                value={this.state.profile.first_name}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="lastname" className="col-sm-4 control-label">Last name</label>
            <div className="col-sm-8">
              <input 
                type="text" 
                className="form-control" 
                id="lastname" 
                onChange={this.handleChange}
                value={this.state.profile.last_name}/>
            </div>
          </div>
          {
            this.state.emails.map( (email, i) => {
              //start counting at 1
              let index = i + 1;
              return (
                <div className="form-group" key={`email${index}`}>
                  <label htmlFor={`email${index}`} className="col-sm-4 control-label">{`Email address ${index}`}</label>
                  <div className="col-sm-8">
                    <input 
                      type="email" 
                      className="form-control" 
                      id={`email${index}`} 
                      onChange={this.handleChange}
                      value={email.address}/>
                  </div>
                </div>
              )
            })
          }
          <UserRoles 
            userRoles = {this.state.roles}
            allRoles = {this.props.allRoles}
            isAdmin = {Roles.userIsInRole(Meteor.userId()),'admin'} 
            onChange = {this.updateRoles} />
          <hr/>
          <UserProfileButtons 
            oldState = {this.props.user}
            newState = {this.state}
            cancelChanges = {this.cancelChanges}
            saveChanges = {this.saveChanges}
            resetPassword = {this.resetPassword}
            deleteAccount = {this.deleteAccount}/>
        </form>
      </div>
    )
  }
}

export default UserProfileContainer = createContainer(() => {
  const subscription = Meteor.subscribe('users');
  const userId = FlowRouter.getParam('_id');
  const userProfile = userId ? Meteor.users.findOne({_id: userId}) : Meteor.user();
  const allRoles = Meteor.users.find({}).fetch().reduce((roles, user) => {
    return roles.concat(user.roles)
  },[])
  const uniqueRoles = [...new Set(allRoles)]
   return {
    user: pick(userProfile, ['_id','username', 'emails', 'profile', 'roles']),
    loading: !subscription.ready(),
    allRoles: uniqueRoles
   }
},UserProfile)
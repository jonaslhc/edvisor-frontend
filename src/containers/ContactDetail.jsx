import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';

import { contactListQuery } from './ContactBar';


import '../styles/contactDetail.css';

const mapStateToProps = state => (
  { 
    contactDetail: state.contact,
    contacts: state.contacts,
  }
);

const modifyContactMutation = gql`
  mutation modifyContactMutation($contactId: String!, $firstName: String, $lastName: String, $phone: String, $address: String, $email: String) {
    modifyContact(contactId: $contactId, firstName: $firstName, lastName: $lastName, phone: $phone, address: $address, email: $email) {
      firstname
      lastname
      address
      phone
      email
    }
  }
`;

class ContactDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      edited: false,
      contactId: -1,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      unsubscribe: {},
    };

    this.setContactInfo = this.setContactInfo.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleSuccess = this.toggleSuccess.bind(this);
    this.populateContact = this.populateContact.bind(this);
  }

  componentDidMount() {
    this.state.unsubscribe = this.props.store.subscribe(() => {
      if (this.props.store.getState().contacts && this.props.store.getState().contacts.contact) {
        this.setContactInfo(this.props.store.getState().contacts.contact);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    console.log('match', nextProps);
    if (nextProps.match.params.id && Object.keys(nextProps.contacts.contacts).length > 0) {
      const contactId = nextProps.match.params.id;
      if (!isNaN(parseFloat(contactId)) && isFinite(contactId) && contactId >= 0) {
        this.populateContact(contactId, nextProps.contacts.contacts);
      }
    }
  }

  componentWillUnmount() {
    this.state.unsubscribe();
  }

  // sameContacts(nextProp, currProp) {
  //   if (Object.keys(nextProp).length > 0) return false;

  //   if (nextProp && currProp && nextProp.contacts && currProp.contacts) {
  //     if (nextProp.contacts.length !== currProp.contacts.length) return false;
  //     for (let i = 0; i < nextProp.length; i++) {
  //       if (nextProp.contacts[i].id !== currProp.contacts[i].id) return false;
  //     }
  //   }

  //   return true;
  // }

  setContactInfo(data) {
    this.setState({
      contactId: data.contactId,
      firstName: data.firstname,
      lastName: data.lastname,
      phone: data.phone,
      email: data.email,
      address: data.address,
    });
  }

  populateContact(contactId, contacts) {
    const validContact = contacts.find((contact) => {
      return contact.contactId === contactId;
    });

    console.log('valid', validContact);
    if (validContact) {
      this.setContactInfo(validContact);
    }
  }

  toggle() {
    this.setState({
      modal: !this.state.modal,
    });
  }

  toggleSuccess() {
    this.setState({
      modal: !this.state.modal,
      edited: true,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      address: this.address.value,
      email: this.email.value,
      phone: this.phone.value,
    });

    this.props.mutate({
      variables: {
        contactId: this.state.contactId,
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        address: this.address.value,
        email: this.email.value,
        phone: this.phone.value,
      },
      refetchQueries: [{ query: contactListQuery }],
    }).then((res) => {
      console.log('success', res);
    });
  }

  render() {
    const {
      firstName, lastName, phone, email, address,
    } = this.state;

    console.log('contacts.contacts', this.props);

    return (
      <div>
        <div className="contact-detail-container">
          <div className="edit-button-container">
            <Button className="edit-button" color="secondary" onClick={this.toggle}>Edit</Button>
          </div>
          <Modal isOpen={this.state.modal} toggle={this.toggle} className="">
            <ModalHeader toggle={this.toggle}>Edit {firstName} {lastName}</ModalHeader>
            <ModalBody>
              <Input placeholder="First Name" innerRef={(el) => { this.firstName = el; }} />
              <br />
              <Input placeholder="Last Name" innerRef={(el) => { this.lastName = el; }} />
              <br />
              <Input placeholder="Phone" innerRef={(el) => { this.phone = el; }} />
              <br />
              <Input placeholder="Email" innerRef={(el) => { this.email = el; }} />
              <br />
              <Input placeholder="Address" innerRef={(el) => { this.address = el; }} />
            </ModalBody>
            <ModalFooter>
              <Button color="success" onClick={this.toggleSuccess}>Done</Button>{' '}
              <Button color="secondary" onClick={this.toggle}>Cancel</Button>
            </ModalFooter>
          </Modal>
          {firstName &&
            <div>
              <h2>{ firstName } { lastName }</h2>
              <p>Phone: { phone }</p>
              <p>Email: { email }</p>
              <p>Address: { address }</p>
            </div>
          }
          {!firstName && <h2>No Contact is selected</h2>}
        </div>
      </div>
    );
  }
}

ContactDetail.propType = {
  contactDetail: PropTypes.object,
  contacts: PropTypes.array,
  store: PropTypes.object,
  match: PropTypes.object,
};

export default connect(mapStateToProps)(graphql(modifyContactMutation)(ContactDetail));

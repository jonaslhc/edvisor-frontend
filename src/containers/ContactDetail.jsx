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
    contactDetail: state.contacts.contact,
    contacts: state.contacts.contacts,
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
      contactId: -1,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
    };

    this.setContactInfo = this.setContactInfo.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleSuccess = this.toggleSuccess.bind(this);
    this.populateContact = this.populateContact.bind(this);
  }

  componentDidMount() {
    if (this.props.contactDetail) {
      this.setContactInfo(this.props.contactDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id && Object.keys(nextProps.contacts).length > 0) {
      const contactId = nextProps.match.params.id;
      if (!isNaN(parseFloat(contactId)) && isFinite(contactId) && contactId >= 0) {
        this.populateContact(contactId, nextProps.contacts);
      }
    }
    if (nextProps.contactDetail) {
      this.setContactInfo(nextProps.contactDetail);
    }
  }

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

    return (
      <div>
        <div className="contact-detail-container">
          <div className="edit-button-container">
            <Button className="edit-button" color="secondary" onClick={this.toggle}>Edit</Button>
          </div>
          <Modal isOpen={this.state.modal} toggle={this.toggle} className="">
            <ModalHeader toggle={this.toggle}>Edit {firstName} {lastName}</ModalHeader>
            <ModalBody>
              <div className="modal-container">
                <span>First Name</span>
                <Input className="modal-input" placeholder="First Name" innerRef={(el) => { this.firstName = el; }} />
              </div>
              <div className="modal-container">
                <span>Last Name</span>
                <Input className="modal-input" placeholder="Last Name" innerRef={(el) => { this.lastName = el; }} />
              </div>
              <div className="modal-container">
                <span>Phone</span>
                <Input className="modal-input" placeholder="111-111-1111" innerRef={(el) => { this.phone = el; }} />
              </div>
              <div className="modal-container">
                <span>Email</span>
                <Input className="modal-input" placeholder="example@example.com" innerRef={(el) => { this.email = el; }} />
              </div>
              <div className="modal-container">
                <span>Address</span>
                <Input className="modal-input" placeholder="Address" innerRef={(el) => { this.address = el; }} />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="info" onClick={this.toggleSuccess}>Done</Button>{' '}
              <Button color="secondary" onClick={this.toggle}>Cancel</Button>
            </ModalFooter>
          </Modal>
          {firstName &&
            <div className="contact-detail-display-container">
              <h2>{ firstName } { lastName }</h2>
              <p>Phone: ({phone.substring(0, 3)}) {phone.substring(3, 6)}-{phone.substring(6)} </p>
              <p>Email: {email}</p>
              <p>Address: {address}</p>
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

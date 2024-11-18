import React, { useState, useContext } from 'react';
import { Button, Form, Col, Row } from 'react-bootstrap';
import { UserContext } from '../../../App';
import axiosInstance from '../../common/AxiosInstance';

const AddCourse = () => {
   const user = useContext(UserContext);
   const [addCourse, setAddCourse] = useState({
      userId: user?.userData?._id || '', // Ensure fallback for userId
      C_educator: '',
      C_title: '',
      C_categories: '',
      C_price: '',
      C_description: '',
      sections: [],
   });

   const handleChange = (e) => {
      const { name, value } = e.target;
      setAddCourse({ ...addCourse, [name]: value });
   };

   const handleCourseTypeChange = (e) => {
      setAddCourse({ ...addCourse, C_categories: e.target.value });
   };

   const addInputGroup = (e) => {
      e.preventDefault(); // Prevent form submission on clicking "Add Section"
      setAddCourse({
         ...addCourse,
         sections: [
            ...addCourse.sections,
            {
               S_title: '',
               S_description: '',
               S_content: null,
            },
         ],
      });
   };

   const handleChangeSection = (index, e) => {
      const updatedSections = [...addCourse.sections];
      const sectionToUpdate = updatedSections[index];

      if (e.target.name === 'S_content') {
         sectionToUpdate.S_content = e.target.files[0]; // Handle file input
      } else {
         sectionToUpdate[e.target.name] = e.target.value;
      }

      setAddCourse({ ...addCourse, sections: updatedSections });
   };

   const removeInputGroup = (index) => {
      const updatedSections = [...addCourse.sections];
      updatedSections.splice(index, 1);
      setAddCourse({ ...addCourse, sections: updatedSections });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!addCourse.C_title || !addCourse.C_description || addCourse.sections.length === 0) {
         alert('Please fill all required fields and add at least one section.');
         return;
      }

      const formData = new FormData();
      Object.keys(addCourse).forEach((key) => {
         if (key === 'sections') {
            addCourse[key].forEach((section, index) => {
               if (section.S_content instanceof File) {
                  formData.append(`sections[${index}][S_content]`, section.S_content);
               }
               formData.append(`sections[${index}][S_title]`, section.S_title);
               formData.append(`sections[${index}][S_description]`, section.S_description);
            });
         } else {
            formData.append(key, addCourse[key]);
         }
      });

      try {
         const res = await axiosInstance.post('/api/user/addcourse', formData, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
               'Content-Type': 'multipart/form-data',
            },
         });

         if (res.status === 201 && res.data.success) {
            alert(res.data.message);
         } else {
            alert(res.data.message || 'Failed to create course.');
         }
      } catch (error) {
         console.error('An error occurred:', error);
         alert('An error occurred while creating the course');
      }
   };

   return (
      <div>
         <Form className="mb-3" onSubmit={handleSubmit}>
            <Row className="mb-3">
               <Form.Group as={Col} controlId="formGridJobType">
                  <Form.Label>Course Type</Form.Label>
                  <Form.Select value={addCourse.C_categories} onChange={handleCourseTypeChange} required>
                     <option value="">Select categories</option>
                     <option>IT & Software</option>
                     <option>Finance & Accounting</option>
                     <option>Personal Development</option>
                  </Form.Select>
               </Form.Group>
               <Form.Group as={Col} controlId="formGridTitle">
                  <Form.Label>Course Title</Form.Label>
                  <Form.Control
                     name="C_title"
                     value={addCourse.C_title}
                     onChange={handleChange}
                     type="text"
                     placeholder="Enter Course Title"
                     required
                  />
               </Form.Group>
            </Row>

            <Row className="mb-3">
               <Form.Group as={Col} controlId="formGridEducator">
                  <Form.Label>Course Educator</Form.Label>
                  <Form.Control
                     name="C_educator"
                     value={addCourse.C_educator}
                     onChange={handleChange}
                     type="text"
                     placeholder="Enter Course Educator"
                     required
                  />
               </Form.Group>
               <Form.Group as={Col} controlId="formGridPrice">
                  <Form.Label>Course Price (Rs.)</Form.Label>
                  <Form.Control
                     name="C_price"
                     value={addCourse.C_price}
                     onChange={handleChange}
                     type="text"
                     placeholder="For free course, enter 0"
                     required
                  />
               </Form.Group>
               <Form.Group as={Col} controlId="formGridDescription">
                  <Form.Label>Course Description</Form.Label>
                  <Form.Control
                     name="C_description"
                     value={addCourse.C_description}
                     onChange={handleChange}
                     as="textarea"
                     placeholder="Enter Course Description"
                     required
                  />
               </Form.Group>
            </Row>

            <hr />

            {addCourse.sections.map((section, index) => (
               <div key={index} className="border rounded-3 p-3 mb-4">
                  <Row className="mb-3">
                     <Form.Group as={Col} controlId={`formGridTitle${index}`}>
                        <Form.Label>Section Title</Form.Label>
                        <Form.Control
                           name="S_title"
                           value={section.S_title}
                           onChange={(e) => handleChangeSection(index, e)}
                           type="text"
                           placeholder="Enter Section Title"
                           required
                        />
                     </Form.Group>
                     <Form.Group as={Col} controlId={`formGridContent${index}`}>
                        <Form.Label>Section Content (Video or Image)</Form.Label>
                        <Form.Control
                           name="S_content"
                           onChange={(e) => handleChangeSection(index, e)}
                           type="file"
                           accept="video/*,image/*"
                           required
                        />
                     </Form.Group>
                  </Row>
                  <Form.Group controlId={`formGridDescription${index}`}>
                     <Form.Label>Section Description</Form.Label>
                     <Form.Control
                        name="S_description"
                        value={section.S_description}
                        onChange={(e) => handleChangeSection(index, e)}
                        as="textarea"
                        placeholder="Enter Section Description"
                        required
                     />
                  </Form.Group>
                  <Button variant="danger" className="mt-3" onClick={() => removeInputGroup(index)}>
                     Remove Section
                  </Button>
               </div>
            ))}

            <Button variant="secondary" className="mb-3" onClick={addInputGroup}>
               Add Section
            </Button>
            <Button variant="primary" type="submit">
               Submit
            </Button>
         </Form>
      </div>
   );
};

export default AddCourse;

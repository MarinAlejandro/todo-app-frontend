import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Duty {
    id: string;
    name: string;
}

const TodoList = () => {
    const [duties, setDuties] = useState<Duty[]>([]);
    const [newDuty, setNewDuty] = useState<string>('');
    const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
    const [editingName, setEditingName] = useState<string>('');

    useEffect(() => {
        // Fetch the list of duties when the component mounts
        axios.get('/api/duties').then((response) => {
            setDuties(response.data);
        });
    }, []);

    // Function to handle adding a new duty
    const addDuty = () => {
        axios.post('/api/duties', { name: newDuty }).then((response) => {
            setDuties([...duties, response.data]);
            setNewDuty('');
        });
    };

    // Function to handle editing an existing duty
    const updateDuty = (dutyId: string) => {
        axios.put(`/api/duties/${dutyId}`, { name: editingName }).then((response) => {
            const updatedDuties = duties.map((duty) =>
                duty.id === dutyId ? response.data : duty
            );
            setDuties(updatedDuties);
            setEditingDuty(null);  // Reset after updating
            setEditingName('');    // Clear the input
        });
    };

    // Function to handle setting the duty for editing
    const startEditing = (duty: Duty) => {
        setEditingDuty(duty);
        setEditingName(duty.name);  // Prefill the input with current duty name
    };

    // Function to handle canceling the edit
    const cancelEditing = () => {
        setEditingDuty(null);
        setEditingName('');
    };

    // Function to handle deleting a duty
    const deleteDuty = (dutyId: string) => {
        axios.delete(`/api/duties/${dutyId}`).then(() => {
            const updatedDuties = duties.filter((duty) => duty.id !== dutyId);
            setDuties(updatedDuties); // Update state to remove deleted duty
        }).catch((error) => {
            console.error('Error deleting duty:', error);
        });
    };

    return (
        <div>
            <h1>To-Do List</h1>

            <ul>
                {duties.map((duty) => (
                    <li key={duty.id}>
                        {editingDuty && editingDuty.id === duty.id ? (
                            <>
                                {/* If editing this duty, show input field */}
                                <input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                />
                                <button onClick={() => updateDuty(duty.id)}>Save</button>
                                <button onClick={cancelEditing}>Cancel</button>
                            </>
                        ) : (
                            <>
                                {duty.name}
                                <button onClick={() => startEditing(duty)}>Edit</button>
                                <button onClick={() => deleteDuty(duty.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <input
                value={newDuty}
                onChange={(e) => setNewDuty(e.target.value)}
                placeholder="New Duty"
            />
            <button onClick={addDuty}>Add Duty</button>
        </div>
    );
};

export default TodoList;

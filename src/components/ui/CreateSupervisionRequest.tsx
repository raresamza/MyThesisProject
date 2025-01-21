import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { SupervisionRequest } from "../../interface/SupervisionRequest";

const CreateSupervisionRequest: React.FC = () => {
  const [formData, setFormData] = useState<SupervisionRequest>({
    id: 0, // Will be assigned by the JSON server
    title: "",
    student: "",
    description: "",
    teacher: "",
    status: "pending",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Send data to the JSON Server
      const response = await fetch("http://localhost:3000/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create supervision request.");
      }

      toast.success("Supervision request created successfully!");
      setFormData({
        id: 0,
        title: "",
        student: "",
        description: "",
        teacher: "",
        status: "pending",
      }); // Reset form
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-2xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create Supervision Request
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title" className="block text-lg font-medium text-gray-700">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter the request title"
              className="mt-2 w-full p-3 border-gray-800 border-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="student" className="block text-lg font-medium text-gray-700">
              Student Name
            </Label>
            <Input
              id="student"
              type="text"
              value={formData.student}
              onChange={(e) => setFormData({ ...formData, student: e.target.value })}
              placeholder="Enter the student's name"
              className="mt-2 w-full p-3 border-gray-800 border-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="description" className="block text-lg font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter the request description"
              className="mt-2 w-full p-3 resize-none h-32 border-gray-800 border-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="teacher" className="block text-lg font-medium text-gray-700">
              Assign to Teacher
            </Label>
            <Input
              id="teacher"
              type="text"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              placeholder="Enter the teacher's name"
              className="mt-2 w-full p-3 border-gray-800 border-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-lg"
          >
            Submit Request
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateSupervisionRequest;

import React, { useEffect, useState } from "react";
import {  Button } from "../ui/button";
import {Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { ThesisFormData } from "../../interface/ThesisFromData";
import { toast } from "sonner"; 
import { Teacher } from "@/interface/Teacher";


const ProposeThesis: React.FC = () => {
  const [formData, setFormData] = useState<ThesisFormData>({
    title: "",
    description: "",
    id: null,
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Fetch available teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch("http://localhost:3000/teachers");
        const data: Teacher[] = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to fetch teachers. Please try again.");
      }
    };

    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.id) {
      toast.error("Please select a teacher.");
      return;
    }

    try {
      const requestPayload = {
        title: formData.title,
        description: formData.description,
        teacherId: formData.id,
        status: "pending", // Set the initial status to "pending"
        student: "Alice Johnson", // Replace with logged-in student's name
      };

      const response = await fetch("http://localhost:3000/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit the thesis proposal");
      }

      toast.success("Thesis proposal submitted successfully!");

      // Reset the form
      setFormData({ title: "", description: "", id: null });
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Failed to submit the thesis proposal. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-2xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Propose a Thesis
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
              placeholder="Enter the thesis title"
              className="mt-2 w-full p-3 border-gray-500 border-2 rounded-md shadow-sm focus:ring-gray-800 focus:border-gray-800"
            />
          </div>
          <div>
            <Label htmlFor="description" className="block text-lg font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter the thesis description"
              className="mt-2 w-full p-3 resize-none h-56 border-gray-500 border-2 rounded-md shadow-sm focus:ring-gray-800 focus:border-gray-800"
            />
          </div>
          <div>
            <Label htmlFor="teacher" className="block text-lg font-medium text-gray-700">
              Select Teacher
            </Label>
            <select
              id="teacher"
              value={formData.id || ""}
              onChange={(e) =>
                setFormData({ ...formData, id: Number(e.target.value) })
              }
              className="mt-2 w-full p-3 border-gray-500 border-2 rounded-md shadow-sm focus:ring-gray-800 focus:border-gray-800"
            >
              <option value="" disabled>
                -- Select a Teacher --
              </option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-lg"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProposeThesis;
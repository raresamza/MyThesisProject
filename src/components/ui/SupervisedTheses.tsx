import React, { useState, useEffect } from "react";
import TableOfTheses from "./TableOfTheses";
import { Thesis } from "@/interface/Thesis ";

const SupervisedTheses: React.FC = () => {
  const [theses, setTheses] = useState<Thesis[]>([]);

  interface RequestFromAPI {
    id: string;
    title: string;
    description: string;
    supervisor?: string | null;
  }
  

  useEffect(() => {
    const fetchTheses = async () => {
      try {
        const response = await fetch("http://localhost:3000/requests");
        const data: RequestFromAPI[] = await response.json();
    
        // Map and ensure supervisor is properly included
        const mappedTheses = data.map((request: RequestFromAPI) => ({
          id: request.id,
          title: request.title,
          description: request.description,
          supervisor: request.supervisor || null, // Map supervisor field
        }));
    
        setTheses(mappedTheses);
      } catch (error) {
        console.error("Error fetching theses:", error);
      }
    };

    fetchTheses();
  }, []);

  return (
    <div>
      <TableOfTheses theses={theses} />
    </div>
  );
};

export default SupervisedTheses;

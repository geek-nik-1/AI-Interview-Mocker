"use client"
import React, { useState } from 'react'; // Corrected useState import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { v4 as uuidv4} from 'uuid';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger, 
} from "@/components/ui/dialog";
import { chatSession } from '@/utils/GeminiAIModel';
import { MockInterview } from '@/utils/schema';
import moment from 'moment'
import { useRouter } from 'next/navigation';

  

const AddNewInterview = () => {
    const [openDailog, setOpenDailog] = useState(false);
    const [jobPosition, setJobPosition] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [jobExperience, setJobExperience] = useState("");
    const [loading, setLoading]=useState(false);
    const [JsonResponse, setJsonResponse]=useState([]);
    const router = useRouter();
    const {user}=useUser();

    const onSubmit = async(e) => {
        setLoading(true);
        e.preventDefault();
        console.log(jobPosition, jobDesc, jobExperience);

        const InputPrompt="Job Position:"+jobPosition+"; Job Description: "+jobDesc+"; Job Experience: "+jobExperience+" Years; Depends on this please give "+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT+" interview questions with answers in Json format. Give us question and answer field on JSON.";
        
        const result=await chatSession.sendMessage(InputPrompt);
        const MockJsonResp=(result.response.text()).replace('```json','').replace('```','');
        console.log(JSON.parse(MockJsonResp));
        setJsonResponse(MockJsonResp);

        if(MockJsonResp){
            const resp=await db.insert(MockInterview)
            .values({
                mockId:uuidv4(),
                jsonMockResp:MockJsonResp,
                jobPosition:jobPosition,
                jobDesc:jobDesc,
                jobExperience:jobExperience,
                createdBy:user?.primaryEmailAddress?.emailAddress,
                createdAt:moment().format('DD-MM-YYYY')
            }).returning({mockId:MockInterview.mockId});

            console.log('Inserted ID:', resp);
            if(resp) {
                setOpenDailog(false);
            }
        }
        else {
            console.log("ERROR");
            router.push('/dashboard/interview/'+resp[0]?.mockId)
        }
        

        setLoading(false);
    }
  return (
    <div>
      <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all' 
      onClick={() => setOpenDailog(true)}>
        <h2 className='text-lg text-center'>+ Add New</h2>
      </div>
      <Dialog open={openDailog}>
        <DialogContent className='max-w-2xl'>
            <DialogHeader>
            <DialogTitle className='text-2xl'>Tells us more about your job interviwing</DialogTitle>
            <DialogDescription>
                <form onSubmit={onSubmit}>
                <div>
                    <h2>Add Details about your job position/role, Job description and Year of experience</h2>
                    <div className='mt-7 my-3'>
                        <label>Job Role/Job Position</label>
                        <Input placeholder='Ex. Machine Learning Engineer' required onChange={(event) => setJobPosition(event.target.value)}></Input>
                    </div>
                    <div className='my-3'>
                        <label>Job Description/ Tech Stack (In Short)</label>
                        <Input placeholder='Ex. Python, Pandas, TensorFlow, PyTorch, MySql etc ' required onChange={(event) => setJobDesc(event.target.value)}></Input>
                    </div>
                    <div className='my-3'>
                        <label>Years of Experience</label>
                        <Input placeholder='Ex.5' type='number' max="100" required onChange={(event) => setJobExperience(event.target.value)}></Input>
                    </div>
                </div>
                <div className='flex gap-5 justify-end'>
                    <Button type='button' variant='ghost' onClick={() => setOpenDailog(false)}>Cancel</Button>
                    <Button type='submit'disabled={loading}>
                        {loading?
                            <>
                            <LoaderCircle className='animate-spin'/>'Generating from AI'
                            </>:'Start Interview'
                        }
                    </Button>
                </div>
                </form>
            </DialogDescription>
            </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default AddNewInterview

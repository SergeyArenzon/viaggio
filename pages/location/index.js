import React, { useEffect, useRef, useState } from "react";
import { locationSchema } from "../../validations/location";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import ImagesUrlInput from "../../components/ImagesUrlInput/ImagesUrlInput";

export default function index() {
  const [imageUrls, setImageUrls] = useState([]);
  const nameRef = useRef();
  const locationRef = useRef();
  const priceRef = useRef();
  const descriptionRef = useRef();
  const latRef = useRef();
  const lngRef = useRef();
  const router = useRouter();

  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession().then((session) => {
      setSession(session);
    });
  }, []);

  const submitHandler = async (event) => {
    event.preventDefault();

    const data = {
      name: nameRef.current.value,
      location: locationRef.current.value,
      price: priceRef.current.value,
      description: descriptionRef.current.value,
      email: session.user.email,
      images: imageUrls,
      coordinate: [latRef.current.value, lngRef.current.value],
    };

    // check for input validity
    const isValid = await locationSchema.isValid(data);

    if (isValid) {
      const response = await fetch("/api/location", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(await response.json());
      router.replace("/");
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <h1>Create New Location</h1>
      <div>Name</div>
      <input type="text" ref={nameRef}></input>
      <div>Location</div>
      <input type="text" ref={locationRef}></input>
      <div>Price</div>
      <input type="number" ref={priceRef}></input>
      <div>Description</div>
      <textarea type="text" ref={descriptionRef}></textarea>
      <ImagesUrlInput imageUrls={imageUrls} setImageUrls={setImageUrls} />
      <input
        type="number"
        step="0.000001"
        ref={latRef}
        placeholder="lat"
      ></input>
      <input
        type="number"
        step="0.000001"
        ref={lngRef}
        placeholder="lng"
      ></input>
      <button>Create</button>
    </form>
  );
}

// route protector

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}

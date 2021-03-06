import { useContext, useEffect, useRef, useState } from "react";
import { Floor } from "../../models/Floor";
import { FloorElement } from "./FloorElement";
import "./AddLocation.scss";
import { ModalsContext } from "../../context/ModalProvider";
import { AddFloorModal } from "./AddFloorModal";
import axios from "../../api/axios";
import { ApiUrls } from "../constants/ApiUrls";
import { Office } from "../../models/Office";
import { LocationContext } from "../../context/LocationProvider";
import { Navigate, useNavigate } from "react-router-dom";
const AddLocationForm = () => {
  const navigate = useNavigate();

  const modalsContext = useContext(ModalsContext);
  const locationsContext = useContext(LocationContext);

  const locationRef = useRef<HTMLInputElement>(null);

  const [location, setLocation] = useState<Office>({
    id: 0,
    name: "",
    floors: [],
  });
  const [locationFocus, setLocationFocus] = useState(false);
  const [locationValid, setLocationValid] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);

  useEffect(() => {
    const roles = localStorage.getItem("role")?.split(",");
    if (!roles?.includes("Manager")) navigate("/");
  }, []);

  useEffect(() => {
    locationRef.current?.focus();
  }, []);
  useEffect(() => {
    if (location.name.length > 0 && floors.length > 0) setLocationValid(true);
    else setLocationValid(false);
  }, [location.name, floors]);

  const addNewFloor = () => {
    modalsContext.setAddFloorOpen(true);
  };

  const onSubmit = async () => {
    try {
      const response = await axios.post(
        ApiUrls.ADD_OFFICE,
        JSON.stringify({ name: location.name }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setLocation({ ...location, id: response.data.officeId });

      locationsContext.addLocation(location);

      await axios.post(
        ApiUrls.ADD_FLOORS,
        JSON.stringify({
          floors: floors,
          officeId: response.data.officeId,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const addFloor = (newFloor: Floor, rows: number, columns: number) => {
    newFloor.officeId = location.id;
    newFloor.rows = rows;
    newFloor.columns = columns;
    console.log(newFloor);
    setFloors([...floors, newFloor]);
  };
  return (
    <>
      <div className="fullscreen">
        <div className="form">
          <section className="addForm">
            <h1>Add new office</h1>
            <form>
              <div className="formField">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  ref={locationRef}
                  onChange={(e) =>
                    setLocation({ ...location, name: e.target.value })
                  }
                  required
                  aria-invalid={locationValid}
                  aria-describedby="locationnote"
                  onFocus={() => {
                    setLocationFocus(true);
                  }}
                  onBlur={() => {
                    setLocationFocus(false);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={addNewFloor}
                className="btn button-form"
              >
                <span className="btn-label">Add floor</span>
              </button>
            </form>
            <div className="formField">
              <label htmlFor="floor">Floors</label>
              <div className="scrollable">
                {floors.map((floor) => {
                  return (
                    <div key={floor.name}>
                      <br />
                      <FloorElement floor={floor} />
                    </div>
                  );
                })}
              </div>
              <button
                onClick={onSubmit}
                className="btn button-form"
                disabled={!locationValid}
              >
                <span className="btn-label">Save office</span>
              </button>
            </div>
            <div className="formField"></div>
          </section>
        </div>
      </div>
      <AddFloorModal
        onSubmit={(e: any, rows: number, columns: number) => {
          addFloor(e, rows, columns);
        }}
      />
      );
    </>
  );
};
export default AddLocationForm;

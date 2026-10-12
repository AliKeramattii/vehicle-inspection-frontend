import {render,screen,fireEvent,waitFor,cleanup,act} from "@testing-library/react";
import {afterEach,expect,test,vi} from "vitest";
import {InspectionLocationMap} from "@/components/location/inspection-location-map";
import type {NeshanMap} from "@/lib/map/neshan-adapter";
class MapFixture implements NeshanMap{
 static mapTypes={neshanVector:"vector"};static current:MapFixture;
 handlers=new Map<string,()=>void>();sources=new Map<string,{setData:ReturnType<typeof vi.fn<(data:unknown)=>void>>}>();center={lat:35.1,lng:51.1};
 constructor(){MapFixture.current=this;}
 on(e:string,f:()=>void){this.handlers.set(e,f);}off(e:string){this.handlers.delete(e);}getCenter(){return this.center;}
 easeTo=vi.fn(()=>this.handlers.get("moveend")?.());remove=vi.fn();resize=vi.fn();
 addSource(id:string){this.sources.set(id,{setData:vi.fn()});}addLayer=vi.fn();getSource(id:string){return this.sources.get(id);}
}
afterEach(()=>{cleanup();delete window.nmp_mapboxgl;});
test("configured SDK moves the selected coordinate and updates real GPS layers without eager permission",async()=>{
 window.nmp_mapboxgl={Map:MapFixture};
 const onChange=vi.fn(),locate=vi.fn().mockResolvedValueOnce({latitude:35.2,longitude:51.2,accuracyMeters:8}).mockResolvedValueOnce({latitude:35.3,longitude:51.3,accuracyMeters:6});
 render(<InspectionLocationMap mapKey="public-map-test" location={{latitude:35.1,longitude:51.1,accuracyMeters:0,formattedAddress:"آدرس ثبت شده",buildingNumber:"",unitFloor:"",parkingDescription:""}} onChange={onChange} service={{locate}}/>);
 await waitFor(()=>expect(MapFixture.current.handlers.has("load")).toBe(true));act(()=>MapFixture.current.handlers.get("load")?.());
 await screen.findByLabelText("نقطه انتخابی بازدید");expect(locate).not.toHaveBeenCalled();
 MapFixture.current.center={lat:35.4,lng:51.4};MapFixture.current.handlers.get("moveend")?.();expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({latitude:35.4,longitude:51.4,accuracyMeters:0}));
 fireEvent.click(screen.getByRole("button",{name:"بازگشت به موقعیت من"}));await waitFor(()=>expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({accuracyMeters:8})));
 fireEvent.click(screen.getByRole("button",{name:"بازگشت به موقعیت من"}));await waitFor(()=>expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({accuracyMeters:6})));
 expect(MapFixture.current.getSource("device-accuracy")?.setData).toHaveBeenCalledTimes(1);expect(MapFixture.current.getSource("device-position")?.setData).toHaveBeenCalledTimes(1);
 const map=MapFixture.current;cleanup();expect(map.remove).toHaveBeenCalledTimes(1);
});
